# Handoff: CashDrop — private claim links for shielded ZEC

## Overview
CashDrop lets someone send shielded ZEC through a private claim link, even when the recipient has no wallet yet. The sender seals ZEC into a one-time shielded "envelope", shares the link (or a QR card), and the recipient claims it into their own shielded wallet. Until claimed, the sender can take it back.

This package covers: marketing website, threat model page, mobile app (all flows + edge states), desktop web app, printable QR gift card, and a pitch deck.

## About the design files
The files here are **design references built in HTML** — interactive prototypes showing intended look and behaviour, not production code. Recreate them in the target stack (the spec suggests a Rust wallet engine + small web UI or Tauri wrapper). All blockchain activity in the prototypes is **simulated with timers**; no real keys, transactions or network calls exist.

Open any `.dc.html` file directly in a browser. `Envelope.dc.html` is a shared child component; `support.js` is the prototype runtime (ignore it).

## Fidelity
**High fidelity.** Colours, type, spacing, radii and copy are final. Recreate pixel-accurately.

## Design tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| bg | `#0d0d0b` | App/page ground |
| bg-alt | `#121210` | Alternate website sections, input fill |
| surface | `#1a1a15` | Cards, list rows, segmented track, sheets |
| surface-2 | `#26261f` | Icon tiles, hover on surface |
| border | `#2e2d27` / `#3a3930` | Hairlines / secondary-button borders |
| border-strong | `#55534a` | Unchecked checkbox, pending ring |
| text | `#f2eee3` | Primary text |
| text-2 | `#d6d1c1` | Body copy |
| muted | `#a9a593` | Labels, meta |
| dim | `#6f6c60` | Placeholders, disabled step labels |
| accent (yellow) | `#f4b729` | Primary buttons, amounts, mainnet, success |
| accent-hover | `#ffc53d` | Primary hover |
| accent-press | `#e0a514` | Primary active |
| accent-tint bg / border | `#17140b`/`#14120c` / `#5a4614` | Selected/unclaimed cards, valid input border |
| testnet (blue) | `#6ec1ff` (hover `#8fd0ff`) | Testnet badge, testnet segment, "needs funding" |
| testnet tint | `#0f1720` bg, `#24384a` border | Wrong-network compare box |
| warning (orange) | `#ff8a3d` (hover `#ff9d5c`) | Bearer warnings, take-back, errors |
| warning tint | `#1f130c` bg, `#6b3416`/`#7a3c18` border | Warning boxes, error input |
| paper (envelope) | `#ebe4d3` | Envelope, receipt, QR ground |
| paper-empty | `#8f8b7d` | Spent envelope |
| ink | `#1c1b17` / `#15130d` | Text on paper / on yellow |
| seal | `#f4b729` fill, `#dc9a12` ring | Envelope seal coin |

### Type
- **Display/UI:** Bricolage Grotesque (400–800). Headings weight 800, letter-spacing −0.045em to −0.05em, line-height 0.98–1.05.
- **Mono:** DM Mono (400/500) — amounts, addresses, step counters, eyebrows (uppercase, letter-spacing 0.2em).
- Mobile scale: H1 34px (welcome 34 centred, claimed 40), H2 28–30, body 16/1.5, small 13–15, eyebrow 13, amount input 54px mono.
- Desktop/web scale: H1 clamp(44px, 6vw, 68px), section H2 clamp(32px, 4vw, 44px), body 16–18.

### Shape & spacing
- Mobile frame 390×844; screen padding 28px top/bottom, 24px sides; header row 44px tall.
- Radii: buttons/pills 999px; cards 20px; list rows 20px; icon tiles 12–14px; sheets 32px top corners; dialogs (desktop) 28px; envelope 3.6% of width.
- Primary button: 56px tall, full width (mobile), yellow, ink text 17px/700. Secondary: 50–52px, transparent, 1px `#3a3930`, 16px/500. Text button: 48px, `#d6d1c1`.
- Network badge: 30px tall, 1.5px border, DM Mono 12px/0.16em. Testnet = dashed blue; Mainnet = solid yellow + 6px dot.
- Focus: `2px solid #f4b729`, offset 2px. Disabled: opacity 0.45.

## Shared component: Envelope
Props: `amount` (string, 4dp), `note`, `number` (e.g. `CD-7Q4K`), `stamp` (SEALED / READY / FOR YOU / OPENED / UNCLAIMED / CLAIMED / TAKEN BACK / EMPTY / DRAFT), `variant` (`sealed` | `opened` | `empty`).
Aspect 684:428. All internal sizes in container-query units so it scales: header mono 2.75cqw/0.2em; amount mono 10.4cqw/500; "ZEC" 3.6cqw/800; note italic 3.5cqw; seal 15.2cqw circle with 0.9cqw ring, centred at 50%/47.9%; stamp box rotated −6°, 0.35cqw border. Flap lines from top corners to centre and bottom corners inward; three wavy guilloche lines near the bottom. `opened`/`empty` replace the seal with a dashed circle; `empty` greys the paper.

## Screens — mobile app (`CashDrop App.dc.html`)
Left-hand panel is a prototype navigator only — not part of the product.

**Onboarding**
1. **Welcome** — logo + Skip; two stacked envelopes (back −5°, front +3°); "Cash you can hand over in a message."; page dots; "Show me how"; "I received a link".
2. **How it works** — eyebrow, H1 "Three moves. No address swap.", three steps with 48px icon tiles joined by a 2px connector; dashed note "Not claimed yet?…"; Next.
3. **The one rule** — yellow card "The link is the money."; three checkbox rows (must all be ticked); "Keys are created and kept on this device only."; CTA disabled until ticked.

**Send**
1. **Create (1 of 3 · Seal)** — amount input (sanitised to 4dp), presets 0.005/0.01/0.05/0.1, breakdown (receive, 0.0001 fee reserved, You fund = amount + fee), optional note (max 60, "never written on-chain"), Testnet/Mainnet segment (badge follows), "Seal the envelope". Creates drop with status `funding`.
2. **Fund (2 of 3)** — "Send exactly X ZEC", QR of envelope address, truncated address + copy, 3-step status (waiting → detected → confirmed). Primary is "Open in my Zcash wallet" until confirmed, then "Continue to share". "Save recovery file" downloads `cashdrop-recovery-YYYY-MM-DD.json`.
3. **Share (3 of 3)** — "Funded and confirmed" pill, envelope (READY), "Now hand it over.", **Share privately** (Web Share API), **QR card** (sheet → print card), **Copy link** (warning sheet first; never copies silently).
4. **Your drops** — totals (waiting incl. funding; claimed), rows with status styling (see below), "+ New", "Restore from recovery file" (file picker).
5. **Drop detail** — envelope with status stamp, title/sub, event timeline, "Share again" + "Take it back" (orange). Take-back sheet: return address, 0.0001 fee, race explanation; confirm → `reclaiming` → `reclaimed`.

Row styling by status: Unclaimed (yellow border + yellow tile, mail icon), Needs funding (dashed blue tile, clock), Claimed (paper tile, check), Taking back (orange label), Taken back (outline only, amount struck through).

**Claim**
1. **Open** — "FOR YOU", envelope (FOR YOU), verification card: checks tick in sequence (Right network, Link intact, Funds confirmed, Not yet claimed); "0.0101 ZEC inside" only after all pass. Orange bearer warning. "Claim it" disabled until verified.
2. **Destination** — address textarea + scan button; validation (below); "Open my Zcash wallet"; dashed "I don't have a wallet yet" → sheet → new wallet flow.
3. **Review** — perforated paper receipt (in envelope / fee / you receive / going to); local-signing note; **slide-to-open** control (drag ≥88% or Enter/Space/→). Prevents double submission.
4. **Claimed** — opened envelope, "It's yours.", confirmations 1→3 bars, tx id + explorer link, "This link is now empty…", "Open my wallet", "Send a CashDrop of your own". Reopening the link now lands on *Already empty*.

**New wallet (recipient)**
1. **Recovery phrase** — 12 words in a 3-col grid, blurred until "Tap to reveal"; "I wrote all 12 words down" checkbox; Continue disabled until both.
2. **Quick check** — pick word #4 from three; correct → returns to Destination with the new address filled in.

**States** (generic template: icon tile, eyebrow, title, body, key/value box, primary + text button)
Already empty · Wrong network (blue, diagonal-stripe ground, "Switch to testnet and claim") · Underfunded · Overfunded · Claim lost to another spender · Claim expired · Unsupported link version · Network unavailable. Exact copy lives in `STATES` in the app's logic.

## Desktop web app (`CashDrop Desktop.dc.html`)
Max width 1200px, top bar (logo, tabs: Your drops / New drop / Open a link, network badge, "Keys stay on this device"). Same flows as mobile in two-column layouts (`auto-fit, minmax(440px, 1fr)`): Create shows a live envelope preview + breakdown beside the form; Fund puts a 380px QR on the right; Your drops is list + sticky detail panel; sheets become centred 480px dialogs. Onboarding collapses to one Welcome screen with the three rules.

## Website (`CashDrop.dc.html`) & Threat model (`Threat Model.dc.html`)
Website sections: sticky nav → hero (chat mock with envelope) → problem (usual way vs CashDrop) → how it works → privacy (explorer mock) → yellow "The link is the money." band → use cases (6) → "What CashDrop is not" chips + quick summary toggle → CTA → footer. Threat model: bearer warning, money flow, who-sees-what table (5 parties), 6 risks with severity + mitigation, 15 controls, honest limits (yellow band).

## Interactions & behaviour
- **Address validation:** empty → no message; `t1…/t3…/tm…` → "That's a transparent address…" (error); `utest1`/`ztestsapling1` on a mainnet drop (or `u1`/`zs1` on testnet) → wrong-network error; correct prefix, ≥40 chars, `[a-z0-9]` → "Shielded {network} address. Looks good." (yellow); otherwise neutral "doesn't look complete". Continue only when valid.
- **Amount input:** digits + one `.`, comma → dot, max 4 decimals; valid range 0 < x ≤ 100.
- **Never** show "ready to claim" or "claimed" before on-chain verification. "Link opened" is not shown as proof of anything.
- **Share:** prefer `navigator.share`; copy only after explicit warning.
- Toasts: pill, `#f2eee3` on ink, 2.6s.

## State model (from the spec)
`DRAFT → AWAITING_FUNDING → FUNDING_DETECTED → FUNDED → (CLAIMING → CLAIMED | RECLAIMING → RECLAIMED | INVALID/CONFLICTED)`. UI statuses in the prototype: `funding`, `unclaimed`, `claimed`, `reclaiming`, `reclaimed`. Store per drop: id, amount, note, network, timestamps (sealed/funded/ended), tx ids, encrypted recovery material, last scanned height — never plaintext secrets.

## Assets
No raster assets. Icons are inline Lucide-style SVGs (stroke 1.75–2.2). The logo is an envelope with a down-arrow, stroke `#f4b729`. QR codes in the prototype are **decorative placeholders** — generate real ones from the claim URL / ZIP-321 payment request.

## Files
- `CashDrop.dc.html` — website
- `Threat Model.dc.html` — threat model page
- `CashDrop App.dc.html` — mobile prototype (all flows + states)
- `CashDrop Desktop.dc.html` — desktop web app
- `Envelope.dc.html` — shared envelope component
- `QR Gift Card.dc.html` — printable 10×7in fold card
- `CashDrop Pitch Deck.dc.html` + `deck-stage.js` — demo-day deck
- `support.js` — prototype runtime (not for production)
