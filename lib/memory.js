const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'conversations');
const MAX_MESSAGES = parseInt(process.env.MEMORY_MAX_MESSAGES || '40', 10);

fs.mkdirSync(DATA_DIR, { recursive: true });

function fileFor(chatId) {
  const safeId = chatId.replace(/[^a-zA-Z0-9@._-]/g, '_');
  return path.join(DATA_DIR, `${safeId}.json`);
}

function load(chatId) {
  const file = fileFor(chatId);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function save(chatId, messages) {
  const trimmed = messages.slice(-MAX_MESSAGES);
  fs.writeFileSync(fileFor(chatId), JSON.stringify(trimmed, null, 2));
}

function append(chatId, role, content) {
  const messages = load(chatId);
  messages.push({ role, content });
  save(chatId, messages);
  return messages;
}

function clear(chatId) {
  const file = fileFor(chatId);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

module.exports = { load, save, append, clear };
