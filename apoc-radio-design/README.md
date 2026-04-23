# Apocalypse Radio — Design System

> Broadcasting from the rubble. Humans and agents, jamming in real time.

Apocalypse Radio is a collaborative music creation platform where **AI agents and humans work together in real-time to create music**. The core surface is a DAW (Digital Audio Workstation)-style interface for arranging musical elements on a timeline, paired with a live agent chat, real-time audio playback, and waveform visualization. Built for the **Worldcoin × FWB** crypto-cultural audience.

This design system defines the brand, visual language, and component library used across the Apocalypse Radio product suite.

---

## ⚠️ Source Materials

This design system was generated **without an attached codebase, Figma file, or prior brand assets** — only the product brief. Everything here is an **original design invention** grounded in the product concept. If you (the reader) have existing assets (logos, Figma files, a codebase, brand guidelines), please attach them and we'll rebuild this system against them.

- **No Figma link provided**
- **No codebase provided**
- **No existing brand or logo provided**
- **No font files provided** — all fonts are Google Fonts substitutions (see `FONTS` below)

---

## Index

| File | Purpose |
|---|---|
| `README.md` | You are here. Overview, content fundamentals, visual foundations, iconography. |
| `SKILL.md` | Claude/Agent SKill front-matter so this folder can be used as a plug-in brand. |
| `colors_and_type.css` | All tokens (colors, type, spacing, radii, shadows, motion) + semantic classes. |
| `assets/` | Logos, marks, textures, brand illustrations, icon references. |
| `fonts/` | (empty — using Google Fonts via CDN. See FONTS below.) |
| `preview/` | Small HTML cards registered in the Design System tab (tokens, components). |
| `ui_kits/app/` | The DAW product UI kit — timeline, agent chat, transport, mixer. |
| `ui_kits/marketing/` | Marketing site UI kit — hero, manifesto, waitlist. |

---

## The Product

Apocalypse Radio is one app with two public surfaces:

1. **The DAW (app)** — A dark, dense, pro-tool-feeling workspace. Left: track list. Center: timeline with clips + waveforms. Right: agent chat where humans issue prompts and AI agents respond with generated stems, bounces, or suggestions. Bottom: transport bar with play/record, BPM, time, and broadcast status. Top: session header with collaborators (humans + agents).
2. **The marketing site** — A stark, editorial landing page. Big serif display type, emergency-orange signals, dense mono details. Feels like a broadcast rather than a SaaS pitch.

---

## CONTENT FUNDAMENTALS

> How we write. Tone, casing, pronouns, vibe.

Apocalypse Radio speaks like a **pirate radio host with a CS degree**. The voice is confident, a little romantic, a little cryptic. Never cheerful. Never corporate. Always feels like it's being *transmitted* rather than published.

### Tone spectrum

| Axis | Us | Not us |
|---|---|---|
| Register | Lowercase, terse, poetic | Title Case Corporate Announcements |
| Humor | Dry, deadpan, occasionally apocalyptic | Quirky, punny, ✨ sparkly ✨ |
| Technical | Confidently uses DAW/crypto terms | Over-explains |
| Temperature | Warm-voiced, cold-machined | Friendly assistant, exclamation-mark-y |
| Length | Short. Fragments welcome. | Full paragraphs on marketing pages |

### Casing

- Hero & display copy: **sentence case**, sometimes lowercase (`make music with the machines`)
- Section eyebrows & labels: **ALL CAPS, mono, wide letter-spacing** (`[ TRANSMISSION 001 ]`)
- Buttons: **sentence case** (`Tune in`, `Start a session`) — never ALL CAPS
- Bracketed system chatter is encouraged in marketing: `[ now broadcasting ]`, `[ signal: strong ]`, `[ agents online: 14 ]`

### Pronouns & POV

- **We** for the platform. Rare — used sparingly in manifestos.
- **You** for the listener/user. Direct address.
- **They** (not "it") for AI agents. Agents have names (NEPTUNE, DECAY-7, WARMBOOT). They're *collaborators*, not tools.

### Emoji

- **Never.** No emoji in product or marketing copy.
- Instead: monospace bracketed glyphs `[ ◉ REC ]`, `[ ▶ PLAY ]`, `[ ■ STOP ]`, unicode symbols (`◉ ● ○ ◇ ◆ ▲ ▼ ⌇ ⏣`), and mono punctuation (`→`, `·`, `//`, `—`).

### Example copy

**Hero (marketing):**
> *make music with the machines.*
>
> `[ TRANSMISSION 001 ]`
> A DAW built for humans and agents, jamming in the same room. Prompt an AI bandmate. Drop a loop. Broadcast live.
>
> **Tune in →**

**Empty state (app):**
> `[ SIGNAL: QUIET ]`
> Nothing on the timeline yet. Drop a sample, or ask an agent to start something.

**Error:**
> `[ SIGNAL LOST ]`
> Couldn't reach NEPTUNE. Check your connection and try again.

**Agent chat bubble:**
> `NEPTUNE · 00:01:24`
> here's a 4-bar bassline in Dm. grimy. drag it onto track 3 if you want it.

---

## VISUAL FOUNDATIONS

> The look. Tokens, motifs, rules.

### Conceptual direction

**Post-apocalyptic pirate radio × luxury DAW × FWB editorial.** Dark ink backgrounds, bone-white serifs, emergency-orange signals, phosphor-green waveforms, AI-violet accents. Grain everywhere. Square corners. Brutalist typography paired with a delicate italic serif for display moments.

### Color

See `colors_and_type.css` for the full token set.

- **Base: Ink** — `#0B0B0C` canvas, stepped panels up to `#1E1E22`. Never pure `#000` for surfaces (we reserve that for mix wells and embedded media).
- **Foreground: Bone** — `#F7F3EA` warm off-white as primary. Avoid pure white — feels sterile. Bone-700/500/300 for hierarchy.
- **Signals (4 accents)**:
  - **Signal orange `#FF5A1F`** — primary CTA, recording, "ON AIR"
  - **Phosphor green `#8CFF4B`** — waveforms, activity indicators, confirmations
  - **Agent violet `#C56BFF`** — AI agent presence, generative states
  - **Radio cyan `#5EE7FF`** — info, links
  - **Siren red `#FF3344`** — destructive / errors
- **Track colors** — a 6-color palette for timeline tracks (kick/synth/vocal/drum/fx/bass). Used only on the timeline.

**Rule:** One accent dominates per screen. Never two accents at equal weight. Orange is the brand. Green is for signal/data. Violet is reserved for agent moments.

### Type

- **Display: Instrument Serif** — for hero moments, big numbers, quotes. Italic variant used for editorial flourishes.
- **Sans: Space Grotesk** — UI and body copy. Tight, modern, a little weird.
- **Mono: JetBrains Mono** — labels, timestamps, technical data, bracketed system chatter. This is the "voice of the machine" font and it's everywhere in the product.

**Rule of thirds:** A well-composed Apocalypse Radio surface uses all three families — a serif display, a sans body, a mono label.

### Spacing

4px base. Token scale (`--s-1` through `--s-24`). The DAW is dense (8/12/16 dominate); marketing is generous (48/64/96 dominate).

### Backgrounds

- **Primary**: solid ink with grain overlay (`.ar-grain`).
- **Dense surfaces** (DAW panels): flat ink, 1px `--border` dividers, no shadow.
- **Marketing hero**: full-bleed ink with scanlines (`.ar-scanlines`) and an oversized serif headline.
- **No gradients as decoration.** Gradients are allowed *only* as meter fills or waveform gradients (phosphor-green gradient for levels; orange for clipping).
- **Grain texture** (SVG fractal noise, 8% opacity, overlay blend) is baked into the brand and used on nearly every surface.

### Animation

- **Motion character: snap.** DAW feel. Short durations (`--dur-fast: 120ms`), sharp easing (`--ease-snap`).
- **Hover**: 120ms — background brightens one ink step, or border shifts from `--border` to `--border-strong`. No size changes.
- **Press**: `transform: translateY(1px)` + remove inset highlight. Tactile.
- **Entry**: fade + 4px slide up, staggered at 40ms intervals. Only on marketing page load.
- **Waveforms / meters**: real physical motion — peaks spike instantly, decay linearly at ~30dB/s. No spring bounces.
- **Forbidden**: bounce, rubber-band, long fades (>400ms), parallax scrolling, anything "magical".

### Hover & press states

- **Buttons**: hover brightens background by one step; pressed adds `translateY(1px)` + shadow-inset removal.
- **Tracks/clips on timeline**: hover shows 1px phosphor-green outline; drag shows translucent ghost at 60% opacity.
- **Icon buttons**: hover fills the 32×32 tap area with `--ink-400`; active state adds `--glow-signal` when recording/armed.

### Borders

- **1px solid** is the brand default. Double borders are used occasionally on "armed" tracks (`2px double --signal-500`).
- **Corner radius**: mostly `--r-none` (square) or `--r-xs` (2px). Pills (`--r-pill`) reserved for agent avatars and transport chips. **No `border-radius: 16px` rounded cards** — that's the opposite of this brand.

### Shadow & elevation

- Minimal. The DAW is flat — panels separate via ink step-up and 1px dividers, not shadow.
- **`--shadow-lg`** is used sparingly on floating menus and modals.
- **Glows** (`--glow-signal`, `--glow-phosphor`, `--glow-agent`) are reserved for: "ON AIR" indicators, armed tracks, active agents. Glow = aliveness.

### Transparency & blur

- `--bg-overlay` (72% ink) + 20px blur for modal backdrops.
- **No frosted glass panels** in the DAW itself — too soft, kills legibility on dense data.
- Agent chat bubbles occasionally use 8% violet tint on the panel background when an agent is "thinking".

### Imagery

- **Color vibe**: cool, grainy, high-contrast, slightly blown-out highlights. B&W with one orange element is a strong brand move.
- **Subject**: physical instruments in disrepair, CRTs, cables, concrete, night skies, broken neon signs, studio hands in motion blur.
- **Never**: stock-photo people laughing at laptops, gradient meshes, 3D blobs, isometric illustrations.

### Corner radii & cards

- **Cards**: 0 or 2px radius. 1px `--border` divider, no shadow. Often with a mono eyebrow label at top-left and a serif title below.
- **No soft-rounded cards with colored left-borders.** (Known anti-pattern — avoided.)

### Layout rules

- **Fixed elements**: transport bar (bottom, 56px), top session header (48px), left/right DAW panels (280px default, resizable).
- **Marketing**: max-width 1280, centered, generous vertical rhythm, asymmetric text blocks encouraged.
- **Grid**: 12-col on marketing; DAW is not grid-based — it's panel-based.

---

## FONTS

Substituted to Google Fonts pending source files:

| Role | Family | Weights | Source |
|---|---|---|---|
| Display | Instrument Serif | 400 (roman + italic) | Google Fonts |
| Sans | Space Grotesk | 300, 400, 500, 600, 700 | Google Fonts |
| Mono | JetBrains Mono | 300, 400, 500, 600, 700 | Google Fonts |

> **→ If the real brand has custom fonts, please attach the files and we'll swap.** Good candidates for "the real" Apocalypse Radio: a heavier brutalist serif (e.g., IBM Plex Serif Condensed), a more technical mono (e.g., Berkeley Mono, Commit Mono), or a custom grotesk.

---

## ICONOGRAPHY

Apocalypse Radio's icon style is **thin-stroked, square-cornered, technical**. Everything reads like it came off a mixing console or a transmitter panel.

### Icon source

We use **Lucide** (`https://unpkg.com/lucide@0.468.0/dist/umd/lucide.js`) as the primary icon library, loaded via CDN. Lucide's 1.5px-stroke, square-cap style matches the brand's brutalist-technical feel.

**Substitution flag:** Lucide is a placeholder. If the real brand has bespoke icons (likely — a DAW typically has many custom ones: quantize, automation, audio bus, sidechain, etc.) we'll swap them in when provided.

### Supplementary custom SVGs

Custom icons we ship in `assets/icons/` for product-specific concepts Lucide doesn't cover:
- `waveform.svg` — the default "audio" icon
- `agent.svg` — AI agent head
- `broadcast.svg` — on-air tower
- `stem.svg` — music stem
- `quantize.svg` — timeline quantize

### Usage rules

- **Stroke-based only.** Never filled icon shapes in the UI (except for the play triangle and the record dot — those are filled *only* when active).
- **Size**: 14px (dense UI), 16px (default), 20px (buttons), 24px (headers).
- **Color**: inherits `currentColor`. Label text and icon share the same color token.
- **Glyph characters** are equal citizens: the mono font's `◉ ● ○ ◇ ◆ ▲ ▼ ▶ ■ ⏺ ⌇ ⏣` are used inline in system chatter instead of icons.
- **Emoji**: **never used**. See Content Fundamentals.
- **Logo mark**: the broadcast-tower glyph (`assets/logo-mark.svg`) is the only brand icon — used 24px in app chrome, 48px+ on marketing.

---

## UI Kits

| Kit | Path | Screens |
|---|---|---|
| **DAW app** | `ui_kits/app/` | Session / Timeline, Agent chat, Transport, Empty state, Modal |
| **Marketing** | `ui_kits/marketing/` | Hero, Manifesto, Waitlist, Footer |

Open `ui_kits/<kit>/index.html` to see a clickable demo of each.

---
