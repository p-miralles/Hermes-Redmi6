#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
cd ~/Hermes-Redmi6 || exit 1
npm start >> ~/hermes.log 2>&1
