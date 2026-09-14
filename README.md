# Hermes Agent

Termux-based Node.js agent for a Xiaomi Redmi 6 (M1804C3DG), reachable over WhatsApp, that calls a cloud LLM API. Supports Groq (active, free tier) and Mistral (kept configured but deactivated) — switch via `LLM_PROVIDER` in `.env`. No local model inference — all reasoning happens via API call, keeping the on-device footprint light. Designed to run always-on, phone plugged in and idle.

## Install (on the phone, via Termux)

1. Install Termux from F-Droid (not Play Store — outdated build): https://f-droid.org/packages/com.termux/
2. First-time setup:
   ```bash
   termux-setup-storage
   pkg update && pkg upgrade -y
   pkg install nodejs git -y
   ```
3. Get this project onto the phone:
   ```bash
   git clone git@github.com:p-miralles/Hermes-Redmi6.git
   cd Hermes-Redmi6
   npm install
   ```
4. Configure:
   ```bash
   cp .env.example .env
   nano .env   # paste your GROQ_API_KEY (get one free at https://console.groq.com)
   ```
   `LLM_PROVIDER=groq` is the default. To switch back to Mistral later, set `LLM_PROVIDER=mistral` and fill in `MISTRAL_API_KEY`.

## Run

**WhatsApp daemon (main mode)** — persistent, listens for incoming WhatsApp messages and replies using the LLM, with per-chat conversation memory:
```bash
npm start
```
First run prints a QR code in the terminal. On your phone: WhatsApp → Settings → Linked Devices → Link a Device → scan it. Session is saved to `data/wa-auth/` so you only scan once (until you log out or delete that folder).

Send `/reset` in a chat to clear that chat's memory.

**One-shot CLI (quick testing, no WhatsApp)**:
```bash
npm run cli -- "your prompt here"
```

## Conversation memory

Each WhatsApp chat gets its own history file under `data/conversations/`, capped at `MEMORY_MAX_MESSAGES` (default 40) turns — old messages roll off so the LLM context stays small on this hardware. History persists across restarts. `data/` is git-ignored (contains your WhatsApp session credentials and message content — never commit it).

## Keep it running (always-on)

The phone is meant to stay plugged in, idle, running the daemon continuously.

1. Hold a wake lock so Termux isn't killed when the screen locks:
   ```bash
   termux-wake-lock
   ```
2. Auto-start on boot: install **Termux:Boot** from F-Droid, then:
   ```bash
   mkdir -p ~/.termux/boot
   cp scripts/termux-boot/start-hermes.sh ~/.termux/boot/
   chmod +x ~/.termux/boot/start-hermes.sh
   ```
   Edit the `cd` path inside that script if your clone isn't at `~/Hermes-Redmi6`. After a reboot, Termux:Boot runs it automatically (may need to open the Termux:Boot app once to grant permission).
3. In Xiaomi/MIUI settings, disable battery optimization for Termux and Termux:Boot (Settings → Apps → \[app] → Battery saver → No restrictions) — MIUI aggressively kills background processes otherwise.
4. Logs go to `~/hermes.log` when started via the boot script.

The boot script also starts `sshd` (see below), so the phone comes back fully reachable after a reboot without touching it.

## SSH access from another machine

Useful once the phone lives on a pegboard with no keyboard attached.

Setup, once, on the phone:
```bash
pkg install openssh -y
passwd          # set a login password for SSH
sshd            # start the daemon (port 8022)
```

From your computer, on the same network:
```bash
ssh -p 8022 <username>@<phone-ip>
```
`<username>` comes from `whoami` on the phone (looks like `u0_a###`), `<phone-ip>` from `ifconfig wlan0`.

Run long-lived processes under `tmux` so they survive disconnects:
```bash
tmux new -s hermes      # detach with Ctrl+b then d
tmux attach -t hermes   # reattach later
```

Troubleshooting: `ping` failing proves nothing — both Android and macOS drop ICMP echo by default while still accepting TCP. Test the actual port instead, from your computer:
```bash
nc -zv <phone-ip> 8022
```
`Connection refused` means the network path is fine but `sshd` isn't running — start it on the phone. A timeout means the packets aren't arriving at all (different networks, or router client isolation).

## Layout

- `whatsapp.js` — WhatsApp daemon: connects via Baileys, listens for messages, replies via the LLM with per-chat memory
- `index.js` — one-shot CLI entry point for quick testing without WhatsApp
- `lib/llm.js` — shared LLM client (Groq/Mistral), used by both `whatsapp.js` and `index.js`
- `lib/memory.js` — per-chat conversation history, stored as JSON under `data/conversations/`
- `scripts/termux-boot/start-hermes.sh` — boot script for Termux:Boot: holds the wake lock, starts `sshd`, launches the daemon
- `package.json` — dependencies (`@whiskeysockets/baileys`, `qrcode-terminal`, `pino`, `dotenv`)
- `.env.example` — template for required environment variables
