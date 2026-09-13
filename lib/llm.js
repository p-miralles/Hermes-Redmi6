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
  throw new Error(`Unknown LLM_PROVIDER "${PROVIDER}". Use one of: ${Object.keys(PROVIDERS).join(', ')}`);
}
if (!config.apiKey) {
  throw new Error(`Missing API key for provider "${PROVIDER}". Set it in .env`);
}

// messages: array of { role: 'user' | 'assistant' | 'system', content: string }
async function chat(messages) {
  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`${PROVIDER} API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

module.exports = { chat, PROVIDER };
