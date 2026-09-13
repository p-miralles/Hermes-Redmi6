require('dotenv').config();
const path = require('path');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const llm = require('./lib/llm');
const memory = require('./lib/memory');

const AUTH_DIR = path.join(__dirname, 'data', 'wa-auth');
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  'You are Hermes, a helpful personal assistant reachable over WhatsApp. Keep replies concise.';

async function startSocket() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('Scan this QR code with WhatsApp (Linked Devices > Link a Device):');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      console.log('Connection closed.', loggedOut ? 'Logged out — delete data/wa-auth and re-scan QR.' : 'Reconnecting...');
      if (!loggedOut) startSocket();
    } else if (connection === 'open') {
      console.log('Hermes connected to WhatsApp.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const chatId = msg.key.remoteJid;
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        '';

      if (!text.trim()) continue;

      if (text.trim() === '/reset') {
        memory.clear(chatId);
        await sock.sendMessage(chatId, { text: 'Memory cleared.' });
        continue;
      }

      try {
        const history = memory.append(chatId, 'user', text);
        const reply = await llm.chat([{ role: 'system', content: SYSTEM_PROMPT }, ...history]);
        memory.append(chatId, 'assistant', reply);
        await sock.sendMessage(chatId, { text: reply });
      } catch (err) {
        console.error('Error handling message:', err.message);
        await sock.sendMessage(chatId, { text: `Error: ${err.message}` });
      }
    }
  });
}

startSocket().catch((err) => {
  console.error('Fatal error starting Hermes:', err);
  process.exit(1);
});
