# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Initial Node.js agent scaffold: `index.js` calling a cloud LLM API with a prompt from CLI args.
- `.env.example` for API key configuration.
- README with Termux install and run instructions for Xiaomi Redmi 6 (M1804C3DG).

### Changed
- Switched LLM provider from Anthropic Claude to Mistral (native `fetch` call, dropped `@anthropic-ai/sdk` dependency).
- Added Groq as the active provider (hit Mistral rate limits); introduced `LLM_PROVIDER` env var to switch between Groq and Mistral without code changes. Mistral config kept in place but deactivated by default.

### Fixed
- Default Groq model `llama-3.1-8b-instant` was deprecated on the free tier; switched default to `openai/gpt-oss-20b` (Groq's recommended replacement).

### Added
- WhatsApp daemon (`whatsapp.js`) using Baileys — persistent connection, listens for incoming messages, replies via the LLM. QR-code login on first run, session persisted to `data/wa-auth/`.
- Per-chat conversation memory (`lib/memory.js`) — history stored as JSON under `data/conversations/`, capped by `MEMORY_MAX_MESSAGES`. `/reset` command clears a chat's memory.
- Always-on setup: `termux-wake-lock` guidance and a Termux:Boot script (`scripts/termux-boot/start-hermes.sh`) for auto-start on device boot.

### Changed
- Extracted LLM call logic into `lib/llm.js`, shared by both the WhatsApp daemon and the one-shot CLI (`index.js`, now `npm run cli`).
- `npm start` now launches the WhatsApp daemon instead of the one-shot CLI.
- `data/` (WhatsApp credentials + conversation history) added to `.gitignore` — never committed, contains sensitive session data.
