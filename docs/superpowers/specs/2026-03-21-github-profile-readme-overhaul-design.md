# GitHub Profile README Overhaul — Design Spec

**Date:** 2026-03-21
**Author:** DAEMON-404 (Bruce)
**Status:** Draft

---

## Overview

Full overhaul of the DAEMON-404 GitHub profile README. Replacing the existing weather/storm-themed profile with a cyberpunk "Terminal HUD" hybrid — combining terminal session aesthetics with rich visual widgets and dynamic stats cards.

## User Profile

- **Username:** DAEMON-404
- **Name:** Bruce
- **Role:** 4th year ethical hacking student
- **Primary focus:** HTB labs/boxes, pentesting, offensive security
- **NixOS project:** In progress (don't over-emphasize)

## Design Direction

**Style:** Cyberpunk Terminal HUD Hybrid

The README reads like a terminal session (`$ whoami`, `$ cat arsenal.txt`) but each section is populated with rich visual widgets — stats cards, skill icons, shields.io badges, animated SVGs. The terminal framing provides structure; the widgets provide visual impact.

**Color Palette (neon cyberpunk):**
- `#00ff41` — Matrix green (primary)
- `#ff006e` — Hot pink (accent)
- `#00d9ff` — Cyan (links/certs)
- `#8b00ff` — Electric purple (hardware)
- `#0d1117` — Dark background (GitHub dark)

## Section-by-Section Design

### Section 1: Header

- **Animated typing SVG** (DenverCoder1/readme-typing-svg)
  - Font: Fira Code (available on Google Fonts, which the service uses)
  - Text cycles: `DAEMON-404 :: Ethical Hacker` → `Netrunner :: Offensive Security` → `NixOS Enthusiast :: HTB Grinder`
  - Color: Matrix green `#00ff41` on transparent
  - Note: Text on transparent background may be hard to read in GitHub light mode. This is acceptable — the profile is designed for dark mode viewers. Light mode will still be functional but not optimized.
- **Profile view counter** (komarev) — cyberpunk-styled, matrix green. Appears here only (not duplicated in footer).
- Short one-line bio beneath in a terminal code block

### Section 2: About

- Terminal header: `$ whoami`
- Brief Python-style class or terminal output showing:
  - Alias: DAEMON-404
  - Role: 4th year ethical hacking student
  - Focus: Offensive security, pentesting, NixOS
  - Current status: Active on HTB
- Keep it concise — 10 lines max

### Section 3: HTB Stats HUD

- Terminal header: `$ htb --profile`
- **HTB profile badge** embedded via: `https://www.hackthebox.com/badge/image/2188380`
- **Pro Labs certifications** as shields.io badges:
  - `PRO LAB :: DANTE ✔` (cyan `#00d9ff`)
  - `PRO LAB :: ZEPHYR ✔` (cyan `#00d9ff`)
- **Key stats** as shields:
  - `GLOBAL RANK #917` (hot pink `#ff006e`)
  - `58 FLAGS` (hot pink `#ff006e`)
  - `SILVER TIER S10` (hot pink `#ff006e`)
- Link to full HTB profile: https://app.hackthebox.com/users/2188380

### Section 4: Arsenal — Tech Stack

- Terminal header: `$ cat arsenal.txt`
- **Three-layer approach:**

**Layer 1 — Skill Icons strip** (tandpfun/skill-icons):
  - Visual icon row: NixOS, Python, Bash, JavaScript, Linux, Kali, Git

**Layer 2 — Security tools** as shields.io badges (matrix green `#00ff41`):
  - Burp Suite, Metasploit, Wireshark, Nmap, OWASP

**Layer 3 — Operating Systems** as shields.io badges (matrix green):
  - NixOS, Kali Linux, Arch Linux, Debian

### Section 5: Arsenal — Hardware

- Terminal header: `$ lsusb --gadgets`
- Shields.io badges (electric purple `#8b00ff`):
  - Flipper Zero, WiFi Pineapple, BadUSB, Pwnagotchi, Rubber Ducky, OMG Cables, Clockwork uConsole

### Section 6: GitHub Stats Dashboard

- Terminal header: `$ neofetch --github`
- **GitHub stats card** (anuraghazra/github-readme-stats)
  - Dark theme: bg `#0d1117`, text `#c9d1d9`, icons `#00ff41`, title `#00d9ff`, border `#30363d`
- **Streak stats card** (DenverCoder1/github-readme-streak-stats)
  - Matching dark theme, ring `#00d9ff`, fire `#ff006e`, streak numbers `#00ff41`
- **Top languages card** (anuraghazra/github-readme-stats)
  - Compact layout, matching theme
- **Layout:** Stats card and streak card side-by-side using an HTML table (2 columns). Top languages card centered below. All content center-aligned throughout the README.
- **Profile summary cards** (vn7n24fzkq/github-profile-summary-cards)
  - "Productive Time" and "Commits per Language" cards
- **Contribution snake animation** (Platane/snk)
  - Dark mode SVG variant
  - Note: Requires GitHub Actions workflow setup in the repo

### Section 7: Featured Repos

- Terminal header: `$ ls ~/projects/`
- **Repo cards** (anuraghazra/github-readme-stats pin cards) for:
  - `DAEMON-404/IceBreaker`
  - `DAEMON-404/HTB-Lab-Writeups`
- Cyberpunk theme matching stats cards
- Note: Both repos must be public for the cards to render. If either is private, the card will show an error. The user has confirmed these repos exist.

### Section 8: Connect

- Terminal header: `$ cat contact.txt`
- Neon-styled shields.io badges linking to:
  - **Website:** https://daemon-sec.xyz (cyan `#00d9ff`)
  - **HackTheBox:** https://app.hackthebox.com/users/2188380 (HTB green `#9FEF00`)
  - **Email:** iota43_dice@icloud.com (matrix green `#00ff41`)
- **GPG public key** in a collapsible `<details>` block
  - Summary text: `🔐 PGP Public Key (click to expand)`
  - Full key block inside
  - Source: Hardcoded from the existing README.md (the key is already present in the current profile)

### Dividers

- Between each major section: neon-colored ASCII line
- Style: `═══════════════════════════════════════` or similar terminal-style rule

### Footer

- Terminal-style sign-off in code block
- `[SESSION TERMINATED]` / `[LOGGING OFF...]`
- No visitor badge here (appears in header only to avoid duplication)

## External Dependencies

| Widget | Source | Setup Required |
|--------|--------|----------------|
| Typing SVG | readme-typing-svg.demolab.com | None — URL-based |
| GitHub Stats | github-readme-stats.vercel.app | None — URL-based |
| Streak Stats | streak-stats.demolab.com | None — URL-based |
| Profile Summary Cards | github-profile-summary-cards.vercel.app | GitHub Actions workflow |
| Skill Icons | skillicons.dev | None — URL-based |
| Contribution Snake | Platane/snk | GitHub Actions workflow |
| Profile Views | komarev.com | None — URL-based |
| HTB Badge | hackthebox.com/badge | None — URL-based |
| Shields.io | img.shields.io | None — URL-based |

## GitHub Actions Required

Two workflows need to be set up in the repo. The repo uses `master` as its default branch.

1. **Snake animation** (`.github/workflows/snake.yml`)
   - Uses: `Platane/snk/svg-only@v3`
   - Schedule: Daily via cron (`0 0 * * *`)
   - Also triggered on push to `master`
   - Outputs: `dist/github-contribution-grid-snake-dark.svg`
   - Commits output to a dedicated `output` branch
   - Requires: `GITHUB_TOKEN` with default permissions (write to repo)

2. **Profile summary cards** (`.github/workflows/profile-summary-cards.yml`)
   - Uses: `vn7n24fzkq/github-profile-summary-cards@release`
   - Schedule: Daily via cron (`0 0 * * *`)
   - Also triggered on push to `master`
   - Outputs to `profile-summary-card-output` branch
   - Requires: `GITHUB_TOKEN` secret (passed explicitly)

These will be included as workflow YAML files in `.github/workflows/`.

## What's Removed from Old README

- Weather/storm metaphor ("Where Lightning Strikes, Chaos Follows")
- C++ and Java badges
- TryHackMe badge (not mentioned as active)
- Old username references (00xNetrunner)
- NixOS honors project emphasis (kept subtle)
- Progress table with percentage bars
- "Fear the lightning that strikes twice" quote

## What's New

- HTB Pro Labs certifications (Dante + Zephyr)
- HTB stats badges (rank, flags, tier)
- HTB profile badge widget
- Skill Icons visual strip
- Profile Summary Cards (productive time, commits per language)
- Contribution snake animation
- OMG Cables and Clockwork uConsole in hardware
- Collapsible GPG key (saves space)
- Website link (daemon-sec.xyz)
- Three-layer tech stack (icons + security badges + OS badges)
- Featured repo cards (IceBreaker, HTB-Lab-Writeups)

## Layout & Alignment

- **All content is center-aligned** using `<div align="center">` blocks
- Stats cards (GitHub stats + streak) are placed **side-by-side** using an HTML table with 2 columns
- Top languages and profile summary cards are centered below the stats row
- Repo cards for featured projects are side-by-side in a 2-column table
- Badges within each section flow naturally in a centered row (wrapping on narrow screens)
- All images include descriptive `alt` text for accessibility and fallback display

## Light Mode Considerations

This profile is designed primarily for **GitHub dark mode**. In light mode:
- Typing SVG with `#00ff41` text on transparent background will be readable but less striking
- Stats cards use explicit dark background colors, which will appear as dark cards on a white page — this is intentional and looks fine
- Shields.io badges render identically in both modes
- No separate light mode variant is planned — dark mode is the target experience

## Content Tone

Professional cyberpunk — terminal metaphors throughout but not juvenile. Terms like "netrunner" and "arsenal" fit naturally. No cringe, no "hack the planet" jokes. The aesthetic serves the identity: security professional who lives in the terminal.
