require('dotenv').config();

const PROVIDER = process.env.LLM_PROVIDER || 'groq';

const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
  },
};

const config = PROVIDERS[PROVIDER];
if (!config) {
  console.error(`Unknown LLM_PROVIDER "${PROVIDER}". Use one of: ${Object.keys(PROVIDERS).join(', ')}`);
  process.exit(1);
}
if (!config.apiKey) {
  console.error(`Missing API key for provider "${PROVIDER}". Set it in .env`);
  process.exit(1);
}

async function ask(prompt) {
  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`${PROVIDER} API error ${res.status}: ${await res.text()}`);
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
