/* ======================================================
   KwikSend - Espace Pro (version stable)
   Simulation locale avec stockage offline
   Couleurs adaptées à la charte KwikSend (orange / vert)
====================================================== */

const formatEUR = (n) => Number(n).toFixed(2) + " €";
const nowISO = () => new Date().toISOString();
const uid = (len = 10) => Math.random().toString(36).slice(2, 2 + len);

// ----- Sélecteurs -----
const proBalanceEl = document.getElementById("pro-balance");
const clientBalanceEl = document.getElementById("client-balance");
const txTableBody = document.querySelector("#tx-table tbody");
const total30El = document.getElementById("total-30");
const pendingCountEl = document.getElementById("pending-count");
const queueBanner = document.getElementById("queue-banner");
const syncLog = document.getElementById("sync-log");
const netStatusEl = document.getElementById("net-status");

// Boutons
const receiveBtn = document.getElementById("receive-btn");
const receiveSection = document.getElementById("receive-section");
const genLinkBtn = document.getElementById("gen-link-btn");
const reqAmount = document.getElementById("req-amount");
const reqNote = document.getElementById("req-note");
const generatedArea = document.getElementById("generated-area");
const payLinkInput = document.getElementById("pay-link");
const qrCanvas = document.getElementById("qr-canvas");
const simulateClientPayBtn = document.getElementById("simulate-client-pay");
const downloadQrBtn = document.getElementById("download-qr");
const closeReceive = document.getElementById("close-receive");

const transferBtn = document.getElementById("transfer-btn");
const transferSection = document.getElementById("transfer-section");
const transferTypeSelect = document.getElementById("transfer-type");
const transferForm = document.getElementById("transfer-form");
const doTransferBtn = document.getElementById("do-transfer");
const closeTransferBtn = document.getElementById("close-transfer");

const exportBtn = document.getElementById("export-btn");
const clearQueueBtn = document.getElementById("clear-queue-btn");
const topupClientBtn = document.getElementById("topup-client");

// ----- Local Storage -----
const KEY_BAL = "kwik_pro_balance";
const KEY_CLIENT = "kwik_demo_client";
const KEY_TX = "kwik_pro_tx_history";
const KEY_QUEUE = "kwik_offline_queue";

function loadNumber(key, defaultVal = 0) {
  const v = localStorage.getItem(key);
  return v === null ? defaultVal : Number(v);
}
function saveNumber(key, v) {
  localStorage.setItem(key, String(v));
}

// ----- États -----
let proBalance = loadNumber(KEY_BAL, 150.0);
let clientBalance = loadNumber(KEY_CLIENT, 100.0);
let txHistory = JSON.parse(localStorage.getItem(KEY_TX) || "[]");
let offlineQueue = JSON.parse(localStorage.getItem(KEY_QUEUE) || "[]");

function persistTx() {
  localStorage.setItem(KEY_TX, JSON.stringify(txHistory));
}
function persistQueue() {
  localStorage.setItem(KEY_QUEUE, JSON.stringify(offlineQueue));
}
function persistBalances() {
  saveNumber(KEY_BAL, proBalance);
  saveNumber(KEY_CLIENT, clientBalance);
}

// ----- Interface -----
function renderBalances() {
  proBalanceEl.textContent = formatEUR(proBalance);
clientBalanceEl.textContent = formatEUR(clientBalance);
}

// ----- Journal synchronisation -----
function logSync(msg) {
  const time = new Date().toLocaleTimeString();
  syncLog.innerHTML = `<div>[${time}] ${msg}</div>` + syncLog.innerHTML;
}

// ----- Statut réseau -----
function updateNetworkStatus() {
  const online = navigator.onLine;
  netStatusEl.textContent = online ? "En ligne" : "Hors ligne";
  netStatusEl.className = online ? "green" : "offline";
}
window.addEventListener("online", () => {
  updateNetworkStatus();
  logSync("Connexion revenue, synchronisation en cours...");
  processQueue();
});
window.addEventListener("offline", () => {
  updateNetworkStatus();
  logSync("Mode hors-ligne activé.");
});

// ----- Synchronisation des actions offline -----
async function processQueue() {
  if (!navigator.onLine || offlineQueue.length === 0) return;
  while (offlineQueue.length) {
    const action = offlineQueue.shift();
    await new Promise(r => setTimeout(r, 400));
    const tx = {
      id: uid(8),
      date: action.date || nowISO(),
      type: action.txType || action.type,
      detail: action.detail || "Offline sync",
      amount: action.amount || 0,
      status: "ok"
    };
    txHistory.push(tx);
  }
  persistQueue();
  persistTx();
  logSync("✅ Synchronisation terminée.");
  renderTx();
}

// ----- Fonctions utilitaires -----
function addTx(tx) {
  txHistory.push(tx);
  persistTx();
  renderTx();
}
function enqueueOffline(action) {
  offlineQueue.push(action);
  persistQueue();
  logSync("Action ajoutée à la queue offline.");
  renderTx();
}

// ----- QR code simplifié -----
function drawQR(text) {
  const ctx = qrCanvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 220, 220);
  ctx.fillStyle = "#ff7a00";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText("KWIKSEND PRO", 110, 20);
  ctx.fillStyle = "#000";
  for (let i = 0; i < 100; i++) {
    if (Math.random() > 0.6)
      ctx.fillRect(10 + (i % 10) * 20, 50 + Math.floor(i / 10) * 20, 10, 10);
  }
  ctx.fillStyle = "#444";
  ctx.fillText(text.slice(0, 18) + "...", 110, 210);
}

// ----- Paiement client (simulation) -----
simulateClientPayBtn.addEventListener("click", () => {
  const amt = Number(reqAmount.value);
  if (!amt || amt <= 0) return alert("Montant invalide");
  if (clientBalance < amt) return alert("Solde client insuffisant.");

  clientBalance -= amt;
  proBalance += amt;
  persistBalances();

  const tx = {
    id: uid(10),
    date: nowISO(),
    type: "reception",
    detail: "Paiement client",
    amount: amt,
    status: navigator.onLine ? "ok" : "pending"
  };

  if (navigator.onLine) addTx(tx);
  else enqueueOffline({ type: "reception", amount: amt, date: tx.date });

  renderBalances();
  alert("Paiement simulé ✅");
});

// ----- Export CSV -----
exportBtn.addEventListener("click", () => {
  if (!txHistory.length) return alert("Aucune transaction à exporter.");
  const rows = [["date", "type", "detail", "amount", "status"]];
  txHistory.forEach(t =>
    rows.push([t.date, t.type, t.detail, t.amount, t.status])
  );
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "releve_kwiksend.csv";
  a.click();
});

// ----- Recharge client demo -----
topupClientBtn.addEventListener("click", () => {
  clientBalance += 50;
  persistBalances();
  renderBalances();
  logSync("Client demo rechargé +50€");
});

// ----- Initialisation -----
renderBalances();
renderTx();
updateNetworkStatus();
processQueue();