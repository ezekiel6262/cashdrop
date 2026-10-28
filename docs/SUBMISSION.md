# Zecathon submission — CashDrop

## Submission checklist

- [x] Public open-source GitHub repository
- [x] MIT license
- [x] Public working testnet deployment
- [x] Detailed README and architecture
- [x] Privacy threat model
- [x] 1080p narrated demo video (1:48, within the two-minute submission limit)
- [x] Submission-ready screenshots
- [x] Pitch deck
- [ ] Upload demo video to YouTube and paste the public URL into the submission
- [ ] Add screenshots to the submission form (first image is the cover)
- [ ] Select **Shielded Payments** as the primary track
- [ ] Submit before **October 28, 2026 at 23:59 UTC**

## Project name

CashDrop

## Tagline

Private money, delivered as a link.

## Primary track

Shielded Payments

## One-line description

CashDrop turns shielded ZEC into an encrypted, one-time claim link, so someone can receive private money before they have a wallet.

## Problem

Crypto payments begin with friction. Before a sender can pay, the recipient must install a wallet, protect a seed phrase, find a compatible address, and send it back. Public chains add a second problem: the payment permanently links both parties and the amount.

This makes private onboarding, gifts, refunds, community rewards, and first payments unnecessarily difficult.

## Solution

CashDrop creates a fresh one-time Zcash shielded wallet in the sender's browser. The sender funds its unified address and shares an encrypted bearer link. The recipient opens that link and sweeps the balance into any shielded testnet wallet. The entire wallet engine and zero-knowledge proving pipeline run locally in WebAssembly.

The same foundation powers:

- password-protected one-person drops;
- independent DropBatches for events, rewards, or payroll;
- Private Fund pages without a public donor list or contribution graph;
- CashDrop Checkout for exact-price private point-of-sale requests;
- local merchant verification that scans confirmed shielded transaction history without uploading the recovery seed or publishing a customer record;
- CashDrop Plans for customer-approved shielded subscription renewals;
- sender recovery and reclaim;
- a browser wallet for recipients who do not yet have an address.

## Why Zcash

CashDrop only works as intended when both sides remain shielded. Zcash hides the sender, recipient, and amount while still allowing the recipient's browser to verify and spend the note. A transparent-chain implementation would turn every claim link into a public payment graph.

## Originality

Existing payment links generally encode a destination for the sender. CashDrop reverses the direction: it creates an already-addressed, fundable private envelope that can be handed to a future recipient. Password locking, per-recipient batch isolation, private fundraising, browser wallet onboarding, and sender recovery make it a complete consumer product rather than a URI wrapper.

## Technologies used

Zcash testnet, WebZjs, librustzcash WebAssembly, unified addresses, shielded transactions, Web Crypto API, AES-256-GCM, PBKDF2-SHA-256, JavaScript, PWA/Service Worker, Vercel.

## Challenges

The hardest problem was bringing a real Zcash wallet into an ordinary browser. Threaded WebAssembly required cross-origin isolation, careful static asset caching, and a remote testnet lightwallet gateway. We also had to design links that were useful without overclaiming privacy: password-locked links omit their key, public fund links omit seeds, every batch recipient gets an independent wallet, and the UI labels advisory deadlines honestly.

## What is working

- Live public testnet application.
- Browser-side WebZjs initialization and testnet height lookup.
- Fresh shielded unified address generation.
- Encrypted and password-locked claim links.
- Local scanning, proposal construction, proof generation, and broadcast pipeline.
- DropBatch, Private Fund, recovery/reclaim, and browser wallet flows.

## Links

- Live product: https://www.cashdrop.live/app/?release=8
- Website: https://www.cashdrop.live
- GitHub: https://github.com/ezekiel6262/cashdrop
- Demo: https://www.cashdrop.live/demo/cashdrop-demo.mp4
- Pitch deck: https://www.cashdrop.live/CashDrop%20Pitch%20Deck.dc.html
- Threat model: https://www.cashdrop.live/Threat%20Model.dc.html

## Suggested screenshots order

1. Homepage hero — cover image.
2. CashDrop product modes.
3. Create a password-protected drop.
4. Fund and share screen.
5. DropBatch ready.
6. Private Fund campaign.

## Judge walkthrough

1. Open the live app in a desktop Chromium browser.
2. Create a password-protected 0.01 testnet ZEC drop.
3. Confirm the generated URL contains `l=1` and no `k=`.
4. Save the recovery file.
5. Fund the generated `utest…` address from a testnet wallet.
6. Open the link in a private window, unlock it, and claim to a separate shielded testnet address.
7. Show the shielded transaction on a testnet explorer without exposing sender, recipient, or amount.
8. Briefly show DropBatch and Private Fund to demonstrate the broader consumer product.
