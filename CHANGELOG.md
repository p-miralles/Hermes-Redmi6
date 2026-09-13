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
