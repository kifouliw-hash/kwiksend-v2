/* pro.js
   Simulation Espace Pro - KwikSend
   - stockage : localStorage (pro_balance, pro_tx_history, offline_queue)
   - offline : queue les actions et sync dès qu'on est online
   - génération d'un lien / token simple + QR via canvas (texte)
   - export CSV
*/

// ---------- Helpers ----------
const € = (n) => Number(n).toFixed(2) + ' €';
const nowISO = ()=> new Date().toISOString();
const uid = (len=10) => Math.random().toString(36).slice(2,2+len);

// ---------- Dom refs ----------
const proBalanceEl = document.getElementById('pro-balance');
const clientBalanceEl = document.getElementById('client-balance');
const netStatusEl = document.getElementById('net-status');
const receiveBtn = document.getElementById('receive-btn');
const receiveSection = document.getElementById('receive-section');
const genLinkBtn = document.getElementById('gen-link-btn');
const reqAmount = document.getElementById('req-amount');
const reqNote = document.getElementById('req-note');
const generatedArea = document.getElementById('generated-area');
const payLinkInput = document.getElementById('pay-link');
const qrCanvas = document.getElementById('qr-canvas');
const simulateClientPayBtn = document.getElementById('simulate-client-pay');
const downloadQrBtn = document.getElementById('download-qr');
const closeReceive = document.getElementById('close-receive');

const txTableBody = document.querySelector('#tx-table tbody');
const total30El = document.getElementById('total-30');
const pendingCountEl = document.getElementById('pending-count');
const queueBanner = document.getElementById('queue-banner');
const syncLog = document.getElementById('sync-log');
const exportBtn = document.getElementById('export-btn');
const clearQueueBtn = document.getElementById('clear-queue-btn');

const transferBtn = document.getElementById('transfer-btn');
const transferSection = document.getElementById('transfer-section');
const transferTypeSelect = document.getElementById('transfer-type');
const transferForm = document.getElementById('transfer-form');
const doTransferBtn = document.getElementById('do-transfer');
const closeTransferBtn = document.getElementById('close-transfer');

const topupClientBtn = document.getElementById('topup-client');

// ---------- Storage keys ----------
const KEY_BAL = 'kwik_pro_balance';
const KEY_CLIENT = 'kwik_demo_client';
const KEY_TX = 'kwik_pro_tx_history';
const KEY_QUEUE = 'kwik_offline_queue';

// ---------- Init state ----------
function loadNumber(key, defaultVal=0){
  const v = localStorage.getItem(key);
  return v === null ? defaultVal : Number(v);
}
function saveNumber(key, v){ localStorage.setItem(key, String(v)); }

let proBalance = loadNumber(KEY_BAL, 150.00); // montant initial merchant
let clientBalance = loadNumber(KEY_CLIENT, 100.00);
let txHistory = JSON.parse(localStorage.getItem(KEY_TX) || '[]');
let offlineQueue = JSON.parse(localStorage.getItem(KEY_QUEUE) || '[]');

function persistTx(){ localStorage.setItem(KEY_TX, JSON.stringify(txHistory)); }
function persistQueue(){ localStorage.setItem(KEY_QUEUE, JSON.stringify(offlineQueue)); }
function persistBalances(){ saveNumber(KEY_BAL, proBalance); saveNumber(KEY_CLIENT, clientBalance); }

// ---------- UI render ----------
function renderBalances(){
  proBalanceEl.textContent = €(proBalance);
  clientBalanceEl.textContent = €(clientBalance);
}
function renderTx(){
  txTableBody.innerHTML = '';
  txHistory.slice().reverse().forEach(tx=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(tx.date).toLocaleString()}</td>
      <td>${tx.type}</td>
      <td>${tx.detail || ''}</td>
      <td>${tx.amount < 0 ? '-' : ''}${€(Math.abs(tx.amount))}</td>
      <td>${tx.status}</td>`;
    txTableBody.appendChild(tr);
  });
  // dashboard totals
  const last30 = txHistory.filter(t=>{
    const d = new Date(t.date);
    return (Date.now() - d.getTime()) < 30*24*3600*1000 && t.type === 'reception' && t.status === 'ok';
  }).reduce((s,t)=> s + t.amount, 0);
  total30El.textContent = €(last30);
  // pending
  const pending = txHistory.filter(t=> t.status === 'pending').length + offlineQueue.length;
  pendingCountEl.textContent = pending;
  queueBanner.innerHTML = offlineQueue.length ? `<div class="offline">Transactions offline en attente : ${offlineQueue.length}</div>` : '';
});
}

function logSync(msg){
  const time = new Date().toLocaleTimeString();
  syncLog.innerHTML = `<div>[${time}] ${msg}</div>` + syncLog.innerHTML;
}

// ---------- Network status ----------
function updateNetworkStatus(){
  const online = navigator.onLine;
  netStatusEl.textContent = online ? 'En ligne' : 'Hors ligne';
  netStatusEl.className = online ? 'green' : 'offline';
}
window.addEventListener('online', ()=> { updateNetworkStatus(); logSync('Connexion revenue, synchronisation en cours...'); processQueue(); });
window.addEventListener('offline', ()=> { updateNetworkStatus(); logSync('Passé hors-ligne. Les actions seront mises en queue.'); });
updateNetworkStatus();

// ---------- QR draw function (placeholder) ----------
function drawQR(text){
  const ctx = qrCanvas.getContext('2d');
  const size = qrCanvas.width;
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,size,size);
  ctx.fillStyle = '#000';
  ctx.font = '12px monospace';
  // simple blocky representation: draw text centered and boxes around characters (placeholder)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // Draw border
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  ctx.strokeRect(4,4,size-8,size-8);
  ctx.fillText('KWIKSEND', size/2, 28);
  let y = 60;
  const parts = text.match(/.{1,20}/g) || [text];
  parts.forEach(p=>{
    ctx.fillText(p, size/2, y);
    y += 16;
  });
  // small squares to simulate QR
  for(let i=0;i<10;i++){
    for(let j=0;j<10;j++){
      if(Math.random()>0.6) ctx.fillRect(10+i*18, size-200 + j*18, 10, 10);
    }
  }
}

// ---------- Core features ----------

// add transaction to history
function addTx(tx){
  txHistory.push(tx);
  persistTx();
  renderTx();
}

// queue offline action
function enqueueOffline(action){
  offlineQueue.push(action);
  persistQueue();
  renderTx();
  logSync('Action ajoutée à la queue offline.');
}

// process queue (simulate server sync)
async function processQueue(){
  if(!navigator.onLine) return;
  if(offlineQueue.length === 0) {
    logSync('Aucune action en attente.');
    return;
  }
  // simulate send to server one by one
  while(offlineQueue.length){
    const action = offlineQueue.shift();
    logSync('Synchronisation : ' + action.type + ' - ' + (action.amount ? action.amount + '€' : ''));
    // fake processing time
    await new Promise(r=>setTimeout(r, 500));
    // mark tx as ok and add to history
    const tx = {
      id: uid(12),
      date: action.date || nowISO(),
      type: action.txType || action.type,
      detail: action.detail || 'Offline sync',
      amount: action.amount || 0,
      status: 'ok'
    };
    addTx(tx);
  }
  persistQueue();
  logSync('Synchronisation terminée.');
  renderTx();
}

// ---------- Receive payment flow ----------
receiveBtn.addEventListener('click', ()=> {
  receiveSection.style.display = 'block';
  generatedArea.style.display = 'none';
});

closeReceive.addEventListener('click', ()=> {
  receiveSection.style.display = 'none';
  generatedArea.style.display = 'none';
});

genLinkBtn.addEventListener('click', ()=>{
  const amt = Number(reqAmount.value);
  if(!amt || amt <= 0) return alert('Saisis un montant valide');
  const note = reqNote.value || '';
  // generate token & link (demo)
  const token = uid(14);
  const link = `kwiksend://pay?token=${token}&amount=${amt}&note=${encodeURIComponent(note)}`;
  payLinkInput.value = link;
  generatedArea.style.display = 'block';
  drawQR(link);

  // create a pending transaction in history if offline or pending
  const tx = {
    id: uid(10),
    date: nowISO(),
    type: 'request',
    detail: `Demande: ${note}`,
    amount: amt,
    status: navigator.onLine ? 'waiting' : 'pending' // waiting until client pays
  };
  addTx(tx);
});

simulateClientPayBtn.addEventListener('click', ()=>{
  const link = payLinkInput.value;
  if(!link) return alert('Génère d\'abord un lien');
  // parse params (simple)
  const url = new URL(link.replace('kwiksend://','https://example.com/'));
  const amt = Number(url.searchParams.get('amount') || 0);
  const note = url.searchParams.get('note') || '';
  if(clientBalance < amt) return alert('Solde client insuffisant pour payer.');
  // simulate payment: debit client, credit pro (if online do immediate)
  clientBalance -= amt;
  proBalance += amt;
  persistBalances();
  // create transaction
  const tx = {
    id: uid(12),
    date: nowISO(),
    type: 'reception',
    detail: `Paiement client (note: ${note})`,
    amount: amt,
    status: navigator.onLine ? 'ok' : 'pending'
  };
  if(navigator.onLine){
    addTx(tx);
    logSync('Paiement client traité en ligne.');
  } else {
    // queue the reception to be processed when online
    enqueueOffline({ type:'reception', txType:'reception', amount: amt, detail: tx.detail, date: tx.date });
    addTx({...tx, status:'pending'});
  }
  renderBalances();
  renderTx();
  alert('Paiement simulé ✅');
});

// download QR as image
downloadQrBtn.addEventListener('click', ()=>{
  const dataURL = qrCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'kwik_qr.png';
  a.click();
});

// export CSV
exportBtn.addEventListener('click', ()=>{
  if(!txHistory.length) return alert('Aucune transaction à exporter.');
  const rows = [['date','type','detail','amount','status']];
  txHistory.forEach(t => rows.push([t.date, t.type, t.detail, t.amount, t.status]));
  const csv = rows.map(r => r.map(c=> `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kwiksend_releve_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
});

// clear offline queue
clearQueueBtn.addEventListener('click', ()=>{
  if(!confirm('Vider la queue offline (perte des actions non synchronisées) ?')) return;
  offlineQueue = [];
  persistQueue();
  renderTx();
  logSync('Queue offline vidée manuellement.');
});

// ---------- Transfers ----------------
transferBtn.addEventListener('click', ()=> {
  transferSection.style.display = 'block';
  renderTransferForm();
});
closeTransferBtn.addEventListener('click', ()=> {
  transferSection.style.display = 'none';
});

transferTypeSelect.addEventListener('change', renderTransferForm);

function renderTransferForm(){
  const t = transferTypeSelect.value;
  let html = '';
  if(t === 'iban'){
    html = `
      <div><label class="small">Bénéficiaire (nom)</label><br><input id="tr-name" style="padding:8px;width:100%"></div>
      <div style="margin-top:8px"><label class="small">IBAN</label><br><input id="tr-iban" style="padding:8px;width:100%"></div>
      <div style="margin-top:8px"><label class="small">Montant (€)</label><br><input id="tr-amount" type="number" min="0.01" step="0.01" style="padding:8px;width:160px"></div>
    `;
  } else if(t === 'mobile'){
    html = `
      <div><label class="small">Opérateur</label><br>
        <select id="tr-operator" style="padding:8px">
          <option value="om">Orange Money</option>
          <option value="wave">Wave</option>
          <option value="mtn">MTN Mobile Money</option>
          <option value="moov">Moov</option>
        </select>
      </div>
      <div style="margin-top:8px"><label class="small">Numéro</label><br><input id="tr-phone" style="padding:8px;width:100%"></div>
      <div style="margin-top:8px"><label class="small">Montant (€)</label><br><input id="tr-amount" type="number" min="0.01" step="0.01" style="padding:8px;width:160px"></div>
    `;
  } else if(t === 'kwik'){
    html = `
      <div><label class="small">KwikSend destinataire (email)</label><br><input id="tr-email" style="padding:8px;width:100%"></div>
      <div style="margin-top:8px"><label class="small">Montant (€)</label><br><input id="tr-amount" type="number" min="0.01" step="0.01" style="padding:8px;width:160px"></div>
    `;
  }
  transferForm.innerHTML = html;
}

doTransferBtn.addEventListener('click', ()=>{
  const t = transferTypeSelect.value;
  const amount = Number(document.getElementById('tr-amount')?.value || 0);
  if(!amount || amount <= 0) return alert('Montant invalide');
  if(amount > proBalance) return alert('Solde pro insuffisant');
  let detail = '';
  if(t === 'iban'){
    const name = document.getElementById('tr-name').value || '';
    const iban = document.getElementById('tr-iban').value || '';
    detail = `Virement IBAN (${name} - ${iban})`;
  } else if(t === 'mobile'){
    const op = document.getElementById('tr-operator').value;
    const phone = document.getElementById('tr-phone').value || '';
    detail = `MobileMoney ${op.toUpperCase()} (${phone})`;
  } else if(t === 'kwik'){
    const email = document.getElementById('tr-email').value || '';
    detail = `KwikSend -> ${email}`;
  }
  // subtract immediately
  proBalance -= amount;
  persistBalances();
  // create tx
  const tx = {
    id: uid(11),
    date: nowISO(),
    type: 'transfer',
    detail,
    amount: -amount,
    status: navigator.onLine ? 'ok' : 'pending'
  };
  if(navigator.onLine){
    addTx(tx);
    logSync(`Transfert effectué (${detail})`);
  } else {
    enqueueOffline({ type:'transfer', txType:'transfer', amount: -amount, detail, date: tx.date });
    addTx({...tx, status:'pending'});
  }
  renderBalances();
  renderTx();
  alert('Transfert initié.');
});

// ---------- Client topup ----------
topupClientBtn.addEventListener('click', ()=>{
  clientBalance += 50;
  persistBalances();
  renderBalances();
  logSync('Client demo rechargé +50€');
});

// ---------- Sync at startup ----------
renderBalances();
renderTx();
updateNetworkStatus();
processQueue();

// ---------- Simulate initial form render ----------
renderTransferForm();