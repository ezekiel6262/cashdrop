import initWasm, { initThreadPool, WebWallet, generate_seed_phrase } from './vendor/webzjs/webzjs_wallet.js';

const TESTNET_GATEWAY = 'https://zcash-testnet.chainsafe.dev';
const FEE = 10_000n;
const panel = document.querySelector('#panel');
const workspace = document.querySelector('#workspace');
let wasmReady;
let activeWallet;

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const unb64 = value => Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/') + '='.repeat((4-value.length%4)%4)), c => c.charCodeAt(0));
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const zecToZat = value => { const [whole, frac=''] = String(value).split('.'); return BigInt(whole || 0) * 100_000_000n + BigInt(frac.padEnd(8,'0').slice(0,8)); };
const zatToZec = value => { const whole=value/100_000_000n; const frac=(value%100_000_000n).toString().padStart(8,'0').replace(/0+$/,''); return frac ? `${whole}.${frac}` : String(whole); };

async function initEngine() {
  if (!crossOriginIsolated) throw new Error('The secure wallet engine requires cross-origin isolation. Reload the page after deployment.');
  if (!wasmReady) wasmReady = (async () => {
    await initWasm(new URL('./vendor/webzjs/webzjs_wallet_bg.wasm', import.meta.url));
    await initThreadPool(Math.min(4, Math.max(1, navigator.hardwareConcurrency || 2)));
  })();
  return wasmReady;
}

async function freshWallet() {
  await initEngine();
  if (activeWallet) { try { activeWallet.free(); } catch {} }
  activeWallet = new WebWallet('test', TESTNET_GATEWAY, 1, 1, null);
  return activeWallet;
}

async function encryptClaim(payload) {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const encrypted = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, enc.encode(JSON.stringify(payload)));
  return {d:b64(new Uint8Array(encrypted)),k:b64(keyBytes),n:b64(iv)};
}

async function decryptClaim({d,k,n}) {
  const key = await crypto.subtle.importKey('raw', unb64(k), 'AES-GCM', false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(n)}, key, unb64(d));
  return JSON.parse(dec.decode(plain));
}

function show(content) {
  workspace.classList.remove('hidden');
  panel.innerHTML = content;
  workspace.scrollIntoView({behavior:'smooth',block:'start'});
}

function errorMessage(error) {
  console.error(error);
  return escapeHtml(error?.message || String(error));
}

async function createDrop() {
  show(`<h2>Create a CashDrop</h2><p>Choose an amount and a private note. The one-time testnet wallet will be generated locally.</p>
    <form id="drop-form">
      <label class="field"><span>Amount in testnet ZEC</span><input name="amount" type="number" min="0.0002" max="1000" step="0.00000001" value="0.01" required><small>Includes a separate 0.0001 ZEC claim-fee reserve.</small></label>
      <label class="field"><span>Private note</span><textarea name="note" maxlength="120" rows="3" placeholder="Thanks for helping with the event"></textarea></label>
      <button class="primary" type="submit">Generate private drop</button>
    </form>`);
  document.querySelector('#drop-form').addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = String(data.get('amount'));
    const note = String(data.get('note') || '');
    try {
      show(`<h2>Preparing your drop</h2><div class="status busy">Loading the 60 MB shielded wallet engine…</div><p>The first load is cached by your browser.</p>`);
      const wallet = await freshWallet();
      panel.querySelector('.status').textContent = 'Reading the current Zcash testnet height…';
      const latest = Number(await wallet.get_latest_block());
      const birthday = Math.max(0, latest - 10);
      const seed = generate_seed_phrase();
      panel.querySelector('.status').textContent = 'Deriving a fresh shielded address locally…';
      const accountId = await wallet.create_account('CashDrop', seed, 0, birthday);
      const address = await wallet.get_current_address(accountId);
      const claim = await encryptClaim({v:1,network:'test',seed,birthday,amount,note,createdAt:new Date().toISOString()});
      const link = `${location.origin}${location.pathname}#/claim?${new URLSearchParams(claim)}`;
      const funding = zatToZec(zecToZat(amount) + FEE);
      show(`<h2>Fund, then share</h2><p>Send exactly <strong>${funding} testnet ZEC</strong> to this fresh shielded address:</p>
        <div class="address" id="funding-address">${escapeHtml(address)}</div>
        <div class="row" style="margin-top:16px"><button class="secondary" id="copy-address">Copy address</button><button class="secondary" id="save-recovery">Save recovery</button></div>
        <label class="field"><span>Private claim link</span><textarea id="claim-link" rows="5" readonly>${escapeHtml(link)}</textarea><small>The seed and note are encrypted inside the URL fragment. Whoever has the complete link can claim first.</small></label>
        <button class="primary" id="copy-link">Copy claim link</button>
        <p class="notice">Share only through an end-to-end encrypted chat or in person. Testnet coins have no monetary value.</p>`);
      document.querySelector('#copy-address').onclick = () => navigator.clipboard.writeText(address);
      document.querySelector('#copy-link').onclick = () => navigator.clipboard.writeText(link);
      document.querySelector('#save-recovery').onclick = () => {
        const blob = new Blob([JSON.stringify({type:'CashDrop testnet recovery',address,link,amount,note,birthday},null,2)],{type:'application/json'});
        const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`cashdrop-${birthday}-recovery.json`; a.click(); URL.revokeObjectURL(a.href);
      };
    } catch (error) { show(`<h2>Could not create the drop</h2><p class="error">${errorMessage(error)}</p><button class="secondary" id="retry">Try again</button>`); document.querySelector('#retry').onclick=createDrop; }
  });
}

async function openClaim() {
  const query = location.hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  try {
    if (!params.get('d') || !params.get('k') || !params.get('n')) throw new Error('This claim link is incomplete. Ask the sender to share the entire link.');
    const gift = await decryptClaim({d:params.get('d'),k:params.get('k'),n:params.get('n')});
    if (gift.network !== 'test') throw new Error(`This drop is for ${gift.network}, not testnet.`);
    show(`<h2>You received a CashDrop</h2><div class="amount">${escapeHtml(gift.amount)} <span style="color:var(--gold)">ZEC</span></div>${gift.note?`<p>“${escapeHtml(gift.note)}”</p>`:''}
      <p>Enter a shielded Zcash testnet address. The browser will find the note, construct the proof, and sweep it locally.</p>
      <label class="field"><span>Your testnet shielded address</span><textarea id="destination" rows="4" placeholder="utest1… or ztestsapling1…"></textarea></label>
      <div class="row"><button class="primary" id="claim">Claim privately</button><button class="secondary" id="new-wallet">I need an address</button></div>
      <p class="notice">Anyone with this complete link can claim first. Never send it to support or paste it into another website.</p>`);
    const savedDestination=sessionStorage.getItem('cashdrop-new-address');
    if(savedDestination){document.querySelector('#destination').value=savedDestination;sessionStorage.removeItem('cashdrop-new-address');}
    document.querySelector('#new-wallet').onclick=()=>{sessionStorage.setItem('cashdrop-return-link',location.href); createBrowserWallet(true);};
    document.querySelector('#claim').onclick=()=>claimGift(gift,document.querySelector('#destination').value.trim());
  } catch (error) { show(`<h2>Invalid CashDrop</h2><p class="error">${errorMessage(error)}</p><a class="button secondary" href="./">Open CashDrop</a>`); }
}

async function claimGift(gift, destination) {
  if (!(destination.startsWith('utest1') || destination.startsWith('ztestsapling1'))) {
    return alert('Enter a shielded Zcash testnet address.');
  }
  try {
    show(`<h2>Opening the envelope</h2><div class="status busy">Loading the shielded wallet engine…</div><p>Keep this tab open while the compact blocks are scanned.</p>`);
    const wallet = await freshWallet();
    panel.querySelector('.status').textContent='Importing the one-time key…';
    const accountId=await wallet.create_account('Claim',gift.seed,0,Number(gift.birthday));
    panel.querySelector('.status').textContent='Scanning Zcash testnet from the drop birthday…';
    await wallet.sync();
    const summary=await wallet.get_wallet_summary();
    const balances=summary?.account_balances;
    const entries=Array.isArray(balances)?balances:Array.from(balances?.entries?.()||[]);
    const account=entries.find(([id])=>Number(id)===Number(accountId));
    const pool=account?.[1] || {};
    const spendable=BigInt(pool.sapling_balance?.spendable_value ?? pool.orchard_balance?.spendable_value ?? 0);
    if (spendable<=FEE) throw new Error('No spendable funds were found. The drop may still be unconfirmed, unfunded, or already claimed.');
    panel.querySelector('.status').textContent='Generating the zero-knowledge proof locally…';
    const proposal=await wallet.propose_transfer(accountId,destination,spendable-FEE);
    const txids=await wallet.create_proposed_transactions(proposal,gift.seed,0);
    panel.querySelector('.status').textContent='Broadcasting the shielded transaction…';
    await wallet.send_authorized_transactions(txids);
    show(`<h2>CashDrop claimed</h2><div class="amount">${zatToZec(spendable-FEE)} <span style="color:var(--gold)">ZEC</span></div><p>The shielded transaction was accepted for broadcast. Confirmation can take a few minutes.</p><a class="button primary" href="./">Create a CashDrop</a>`);
    history.replaceState(null,'',location.pathname);
  } catch (error) { show(`<h2>Claim paused</h2><p class="error">${errorMessage(error)}</p><button class="secondary" id="retry-claim">Try again</button>`); document.querySelector('#retry-claim').onclick=openClaim; }
}

async function createBrowserWallet(returnToClaim=false) {
  try {
    show(`<h2>Your testnet wallet</h2><div class="status busy">Generating locally…</div><p>Nothing is uploaded.</p>`);
    const wallet=await freshWallet();
    panel.querySelector('.status').textContent='Connecting to Zcash testnet…';
    const latest=Number(await wallet.get_latest_block());
    const seed=generate_seed_phrase();
    const accountId=await wallet.create_account('Browser wallet',seed,0,Math.max(0,latest-10));
    const address=await wallet.get_current_address(accountId);
    show(`<h2>Back up your wallet</h2><p>Your address is ready. Write down the recovery words before receiving funds.</p>
      <label class="field"><span>Shielded testnet address</span><textarea id="wallet-address" rows="4" readonly>${escapeHtml(address)}</textarea></label>
      <label class="field"><span>24-word recovery phrase</span><div class="secret">${escapeHtml(seed)}</div><small>Never share these words. CashDrop cannot recover them.</small></label>
      <label class="field"><span><input id="backed-up" type="checkbox"> I saved the recovery phrase privately</span></label>
      <div class="row"><button class="secondary" id="copy-wallet">Copy address</button>${returnToClaim?'<button class="primary" id="return-claim" disabled>Return to claim</button>':''}</div>`);
    document.querySelector('#copy-wallet').onclick=()=>navigator.clipboard.writeText(address);
    const check=document.querySelector('#backed-up'); const back=document.querySelector('#return-claim');
    if(back){check.onchange=()=>back.disabled=!check.checked;back.onclick=()=>{const link=sessionStorage.getItem('cashdrop-return-link');sessionStorage.setItem('cashdrop-new-address',address);sessionStorage.removeItem('cashdrop-return-link');location.href=link;};}
  } catch(error){show(`<h2>Wallet unavailable</h2><p class="error">${errorMessage(error)}</p><button class="secondary" id="retry-wallet">Try again</button>`);document.querySelector('#retry-wallet').onclick=()=>createBrowserWallet(returnToClaim);}
}

document.querySelector('#start-create').onclick=createDrop;
document.querySelector('#start-wallet').onclick=()=>createBrowserWallet(false);
if(location.hash.startsWith('#/claim?')) openClaim();
addEventListener('hashchange',()=>{if(location.hash.startsWith('#/claim?'))openClaim();});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.warn);
