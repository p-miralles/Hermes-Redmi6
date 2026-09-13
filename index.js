require('dotenv').config();
const llm = require('./lib/llm');

async function main() {
  const prompt = process.argv.slice(2).join(' ') || 'Hello Hermes';
  const reply = await llm.chat([{ role: 'user', content: prompt }]);
  console.log(reply);
}

main().catch((err) => {
  console.error('Agent error:', err.message);
  process.exit(1);
});
