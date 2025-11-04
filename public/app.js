// app.js complet et optimisé

// =================================
// 🌍 Traductions
// =================================

const translations = {
  fr: {
    "nav.home": "Accueil",
    "nav.features": "Fonctionnalités",
    "nav.advantages": "Avantages",
    "nav.wallet": "Portefeuille",
    "nav.about": "À propos",
    "nav.login": "Connexion",
    "hero.title": "Votre argent, partout, instantanément 🌍",
    "hero.subtitle": "La nouvelle façon d'envoyer et recevoir de l'argent entre l'Afrique et l'Europe.",
    "hero.cta": "Créer un compte gratuit",
  },
  en: {
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.advantages": "Advantages",
    "nav.wallet": "Wallet",
    "nav.about": "About",
    "nav.login": "Login",
    "hero.title": "Your money, everywhere, instantly 🌍",
    "hero.subtitle": "The new way to send and receive money between Africa and Europe.",
    "hero.cta": "Create a free account",
  }
};

// 🌐 Langues
function switchLang(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations(lang);
}

function applyTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.documentElement.lang = lang;
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "fr";
  const langSwitcher = document.getElementById("langSwitcher");
  if (langSwitcher) langSwitcher.value = savedLang;
  applyTranslations(savedLang);
  renderWallet();
  initBurger();
});

// =================================
// 🔐 Modals (Connexion / Signup)
// =================================

function openModal(type) {
  document.getElementById(type + "Modal").style.display = "flex";
}

function closeModal(type) {
  document.getElementById(type + "Modal").style.display = "none";
}

window.onclick = function(event) {
  const login = document.getElementById("loginModal");
  const signup = document.getElementById("signupModal");
  if (event.target === login) login.style.display = "none";
  if (event.target === signup) signup.style.display = "none";
};

// =================================
// 💳 Wallet Simulation
// =================================

let wallet = {
  balance: parseFloat(localStorage.getItem("ks_balance") || "1500"),
  currency: "EUR",
  history: JSON.parse(localStorage.getItem("ks_history") || "[]")
};

function renderWallet() {
  const balanceEl = document.getElementById("wallet-balance");
  const balanceFcfaEl = document.getElementById("wallet-balance-fcfa");
  const historyEl = document.getElementById("wallet-history");

  if (!balanceEl || !historyEl) return;

  balanceEl.textContent = `${wallet.balance.toFixed(2)} ${wallet.currency}`;
  if (balanceFcfaEl) balanceFcfaEl.textContent = `${(wallet.balance * 650).toFixed(0)} FCFA`;

  historyEl.innerHTML = "";
  if (wallet.history.length === 0) {
    historyEl.innerHTML = "<li>Aucun mouvement</li>";
  } else {
    wallet.history.forEach(tx => {
      const li = document.createElement("li");
      li.textContent = `${tx.date} - ${tx.type} : ${tx.amount} ${wallet.currency} (${tx.status || "ok"})`;
      historyEl.appendChild(li);
    });
  }

  localStorage.setItem("ks_balance", wallet.balance);
  localStorage.setItem("ks_history", JSON.stringify(wallet.history));
}

function sendAndRedirect() {
  const amountInput = document.getElementById("amount");
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) return alert("⚠️ Veuillez entrer un montant valide !");
  wallet.balance -= amount;
  wallet.history.unshift({ type: "Envoi", amount: -amount, to: "Test", date: new Date().toLocaleDateString(), status: "validé" });
  renderWallet();
  window.location.href = "transfert.html";
}

function simulateSend() {
  wallet.balance -= 50;
  wallet.history.unshift({ type: "Envoi", amount: -50, to: "Test", date: new Date().toLocaleDateString(), status: "validé" });
  renderWallet();
}

function simulateReceive() {
  wallet.balance += 100;
  wallet.history.unshift({ type: "Réception", amount: +100, from: "Test", date: new Date().toLocaleDateString(), status: "attente" });
  renderWallet();
}

// =================================
// 🍔 Burger + Déconnexion
// =================================

function initBurger() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      nav.classList.toggle("open");
    });
  }
}

// =================================
// 🔁 Modale "Alimenter / Retirer"
// =================================

function openMoveFundsModal() {
  const modal = document.getElementById("moveFundsModal");
  if (modal) modal.style.display = "flex";
}

function closeMoveFundsModal() {
  const modal = document.getElementById("moveFundsModal");
  if (modal) modal.style.display = "none";
}

// =================================
// 🔐 Déconnexion (fonction globale)
// =================================

function logout() {
  localStorage.removeItem("kwiksend_user");
  alert("👋 Vous avez été déconnecté.");
  window.location.href = "connexion.html";
}

// =================================
// 📊 Transferts directs (historique)
// =================================

function saveDirectTransfer(transfer) {
  const HIST_KEY = 'ks_direct_transfers';
  let history = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');

  const newTransfer = {
    id: 'TXN-' + Date.now(),
    date: new Date().toLocaleString('fr-FR'),
    type: transfer.type,
    destination: transfer.destination || transfer.source,
    operator: transfer.operator,
    receiver: transfer.receiver || transfer.sender,
    amount: transfer.amount,
    currency: transfer.currency || 'EUR',
    fees: transfer.fees || 1.50,
    received: transfer.received || (transfer.amount - 1.50),
    status: transfer.status || 'En attente',
    method: transfer.operator ? 'Mobile Money' : 'IBAN',
    timestamp: Date.now()
  };

  history.unshift(newTransfer);
  localStorage.setItem(HIST_KEY, JSON.stringify(history));

  console.log('✅ Transfert enregistré:', newTransfer);
  return newTransfer;
}

function getDirectTransfers() {
  const HIST_KEY = 'ks_direct_transfers';
  const transfers = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
  return transfers.sort((a, b) => b.timestamp - a.timestamp);
}

function getAllTransactions() {
  const oldHistory = JSON.parse(localStorage.getItem('ks_history') || '[]');
  const directTransfers = getDirectTransfers();

  const all = [...directTransfers, ...oldHistory];
  return all.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
}

// =================================
// 🔍 Fonctions de mise à jour et suppression de transferts
// =================================

function getDirectTransferById(id) {
  const transfers = getDirectTransfers();
  return transfers.find(t => t.id === id) || null;
}

function updateTransferStatus(id, newStatus) {
  const HIST_KEY = 'ks_direct_transfers';
  let history = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');

  const transfer = history.find(t => t.id === id);
  if (transfer) {
    transfer.status = newStatus;
    localStorage.setItem(HIST_KEY, JSON.stringify(history));
    console.log('✅ Statut mis à jour:', id, newStatus);
  }
}

function deleteDirectTransfer(id) {
  const HIST_KEY = 'ks_direct_transfers';
  let history = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');

  history = history.filter(t => t.id !== id);
  localStorage.setItem(HIST_KEY, JSON.stringify(history));
  console.log('🗑️ Transfert supprimé:', id);
}

// =================================
// 🔄 Statistiques et Debug
// =================================

function getTransferStats() {
  const transfers = getDirectTransfers();

  const stats = {
    totalCount: transfers.length,
    totalAmount: 0,
    byType: {},
    byOperator: {},
    byStatus: {}
  };

  transfers.forEach(tx => {
    stats.totalAmount += parseFloat(tx.amount) || 0;
    stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
    if (tx.operator) {
      stats.byOperator[tx.operator] = (stats.byOperator[tx.operator] || 0) + 1;
    }
    stats.byStatus[tx.status] = (stats.byStatus[tx.status] || 0) + 1;
  });

  return stats;
}

function cleanTransferHistory(daysOld = 90) {
  const HIST_KEY = 'ks_direct_transfers';
  let history = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');

  const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  const cleaned = history.filter(t => t.timestamp > cutoffDate);

  localStorage.setItem(HIST_KEY, JSON.stringify(cleaned));
  console.log(`🧹 ${history.length - cleaned.length} transferts anciens supprimés`);
}

function debugTransfers() {
  console.log('=== DEBUG HISTORIQUE ===');
  console.log('Transferts directs:', getDirectTransfers());
  console.log('Statistiques:', getTransferStats());
  console.log('Toutes les transactions:', getAllTransactions());
}
