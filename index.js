require('dotenv').config();

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  console.error('Missing MISTRAL_API_KEY. Set it in .env');
  process.exit(1);
}

const MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';

async function ask(prompt) {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Mistral API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
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
