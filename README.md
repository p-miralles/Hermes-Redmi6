# Hermes Agent

Termux-based Node.js agent for a Xiaomi Redmi 6 (M1804C3DG) that calls a cloud LLM API (Anthropic Claude). No local model inference — all reasoning happens via API call, keeping the on-device footprint light.

## Install (on the phone, via Termux)

1. Install Termux from F-Droid (not Play Store — outdated build): https://f-droid.org/packages/com.termux/
2. First-time setup:
   ```bash
   termux-setup-storage
   pkg update && pkg upgrade -y
   pkg install nodejs git -y
   ```
3. Get this project onto the phone (clone from your git remote, or transfer the folder):
   ```bash
   git clone <your-repo-url>
   cd "Hermes Redmi 6"
   npm install
   ```
4. Set your API key:
   ```bash
   cp .env.example .env
   nano .env   # paste your ANTHROPIC_API_KEY
   ```
5. Run:
   ```bash
   npm start -- "your prompt here"
   ```

## Keep it running

Termux is killed when the screen locks unless you hold a wake lock:
```bash
pkg install termux-services
termux-wake-lock
```
Install Termux:Boot (F-Droid) for auto-start on device boot, or Termux:Widget for a home-screen launcher.

## Layout

- `index.js` — agent entry point, sends a prompt to the Anthropic API and prints the reply
- `package.json` — dependencies (`@anthropic-ai/sdk`, `dotenv`)
- `.env.example` — template for required environment variables
