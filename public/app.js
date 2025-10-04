// ==============================
// 🌍 Traductions
// ==============================
const translations = {
  fr: {
    "nav.home": "Accueil",
    "nav.features": "Fonctionnalités",
    "nav.advantages": "Avantages",
    "nav.wallet": "Portefeuille",
    "nav.about": "À propos",
    "nav.login": "Connexion",

    "hero.title": "Votre argent, partout, instantanément 🌍",
    "hero.subtitle": "La nouvelle façon d’envoyer et recevoir de l’argent entre l’Afrique et l’Europe.",
    "hero.cta": "Créer un compte gratuit",

    "features.title": "Ce que vous pouvez faire avec KwikSend",
    "features.wallet.title": "Portefeuille numérique",
    "features.wallet.text": "Gérez votre argent facilement en CFA et en Euro, où que vous soyez.",
    "features.africaeurope.title": "Transferts Afrique ↔ Europe",
    "features.africaeurope.text": "Envoyez ou recevez instantanément entre l’Afrique et l’Europe, sans tracas.",
    "features.kwiksend.title": "Transferts KwikSend ↔ KwikSend",
    "features.kwiksend.text": "Transférez gratuitement ou à petit coût entre utilisateurs KwikSend.",
    "features.mobile.title": "Téléchargement de relevés",
    "features.mobile.text": "Téléchargez un relevé officiel de vos transactions (justificatif administratif).",

    "advantages.title": "Pourquoi choisir KwikSend ?",
    "advantages.speed": "Rapidité : transferts instantanés",
    "advantages.security": "Sécurité : transactions protégées avec 2FA",
    "advantages.access": "Accessibilité : utilisable en Afrique et en Europe",
    "advantages.flex": "Flexibilité : multiples moyens de paiement",

    "wallet.title": "Votre Portefeuille",
    "wallet.balance": "Solde :",
    "wallet.send": "Envoyer",
    "wallet.receive": "Recevoir",
    "wallet.history": "Historique des transactions",

    "about.title": "À propos",
    "about.text": "KwikSend est une solution moderne de transfert d’argent pensée pour connecter l’Afrique et l’Europe, en offrant rapidité, simplicité et sécurité.",

    "footer.rights": "Tous droits réservés.",
    "login.title": "Connexion",
    "login.submit": "Se connecter",
    "login.forgot": "Mot de passe oublié ?",
    "login.signup": "Pas encore de compte ? Inscrivez-vous",
    "signup.title": "Créer un compte",
    "signup.submit": "S’inscrire",
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

    "features.title": "What you can do with KwikSend",
    "features.wallet.title": "Digital Wallet",
    "features.wallet.text": "Easily manage your money in CFA and Euro, wherever you are.",
    "features.africaeurope.title": "Africa ↔ Europe Transfers",
    "features.africaeurope.text": "Send or receive instantly between Africa and Europe, hassle-free.",
    "features.kwiksend.title": "KwikSend ↔ KwikSend",
    "features.kwiksend.text": "Transfer for free or at low cost between KwikSend users.",
    "features.mobile.title": "Download Statements",
    "features.mobile.text": "Download an official statement of your transactions for admin purposes.",

    "advantages.title": "Why choose KwikSend?",
    "advantages.speed": "Speed: instant transfers",
    "advantages.security": "Security: transactions protected with 2FA",
    "advantages.access": "Accessibility: usable in Africa and Europe",
    "advantages.flex": "Flexibility: multiple payment methods",

    "wallet.title": "Your Wallet",
    "wallet.balance": "Balance:",
    "wallet.send": "Send",
    "wallet.receive": "Receive",
    "wallet.history": "Transaction history",

    "about.title": "About",
    "about.text": "KwikSend is a modern money transfer solution designed to connect Africa and Europe, offering speed, simplicity, and security.",

    "footer.rights": "All rights reserved.",
    "login.title": "Login",
    "login.submit": "Sign in",
    "login.forgot": "Forgot password?",
    "login.signup": "No account yet? Sign up",
    "signup.title": "Sign up",
    "signup.submit": "Register",
  }
};

// ==============================
// 🌐 Langues
// ==============================
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

// ==============================
// 🔐 Modals (Connexion / Signup)
// ==============================
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

// ==============================
// 💳 Wallet Simulation
// ==============================
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

// ==============================
// 🍔 Burger + Déconnexion
// ==============================
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

function logout() {
  localStorage.removeItem("kwiksend_user");
  window.location.href = "index.html";
}

// ==============================
// 🔁 Modale “Alimenter / Retirer”
// ==============================
function openMoveFundsModal() {
  const modal = document.getElementById("moveFundsModal");
  if (modal) modal.style.display = "flex";
}
function closeMoveFundsModal() {
  const modal = document.getElementById("moveFundsModal");
  if (modal) modal.style.display = "none";
}
function logout() {
  localStorage.removeItem("kwiksend_user");
  window.location.href = "index.html";
}

// ✅ Ajoute ceci tout à la fin
document.addEventListener("DOMContentLoaded", initBurger);