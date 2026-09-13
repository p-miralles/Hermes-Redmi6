require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Missing ANTHROPIC_API_KEY. Set it in .env');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

async function ask(prompt) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return msg.content[0].text;
}

async function main() {
  const prompt = process.argv.slice(2).join(' ') || 'Hello Hermes';
  const reply = await ask(prompt);
  console.log(reply);
}

main().catch((err) => {
  console.error('Agent error:', err.message);
  process.exit(1);
});
