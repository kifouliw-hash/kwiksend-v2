// server.js - KwikSend Demo API
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==============================
// 🗂️ In-memory store (demo only)
// ==============================
const users = {}; // { email: { name, email, password, token, wallet, pending2fa } }

function createWallet(currency = "EUR") {
  return {
    balance: 1500,
    currency,
    history: [
      { type: "Réception", amount: 500, from: "KwikSend", date: new Date().toISOString() },
      { type: "Envoi", amount: -200, to: "Jean Dupont", date: new Date().toISOString() }
    ]
  };
}

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function generate2FA() {
  return ("" + Math.floor(100000 + Math.random() * 900000));
}

// Middleware auth
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  const user = Object.values(users).find(u => u.token === token);
  if (!user) return res.status(401).json({ success: false, message: "Invalid token" });
  req.user = user;
  next();
}

// ==============================
// 🔐 Auth Routes
// ==============================
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Champs manquants" });
  }
  const lc = email.toLowerCase();
  if (users[lc]) return res.status(400).json({ success: false, message: "Utilisateur existe déjà" });

  const twofa = generate2FA();
  users[lc] = { name, email: lc, password, wallet: createWallet(), pending2fa: twofa, token: null };
  console.log(`[DEMO] 2FA signup pour ${lc}: ${twofa}`);

  return res.json({ success: true, require2fa: true, demo2fa: twofa });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  const lc = email?.toLowerCase();
  const user = users[lc];
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Email ou mot de passe invalide" });
  }

  const twofa = generate2FA();
  user.pending2fa = twofa;
  console.log(`[DEMO] 2FA login pour ${lc}: ${twofa}`);

  return res.json({ success: true, require2fa: true, demo2fa: twofa });
});

app.post("/api/2fa", (req, res) => {
  const { email, code } = req.body || {};
  const lc = email?.toLowerCase();
  const user = users[lc];
  if (!user || user.pending2fa !== code) {
    return res.status(401).json({ success: false, message: "Code invalide" });
  }
  user.pending2fa = null;
  user.token = generateToken();
  return res.json({ success: true, token: user.token, wallet: user.wallet, user: { email: user.email, name: user.name } });
});

app.post("/api/logout", requireAuth, (req, res) => {
  req.user.token = null;
  return res.json({ success: true, message: "Déconnecté" });
});

// ==============================
// 💳 Wallet & Transactions
// ==============================
app.get("/api/wallet", requireAuth, (req, res) => {
  return res.json({ success: true, wallet: req.user.wallet });
});

app.post("/api/send", requireAuth, (req, res) => {
  const { to, amount } = req.body || {};
  if (!to || !amount) return res.status(400).json({ success: false, message: "Données invalides" });

  if (req.user.wallet.balance < amount) {
    return res.status(400).json({ success: false, message: "Solde insuffisant" });
  }

  req.user.wallet.balance -= amount;
  req.user.wallet.history.unshift({ type: "Envoi", amount: -amount, to, date: new Date().toISOString() });

  return res.json({ success: true, wallet: req.user.wallet });
});

// ==============================
// 🌍 Serve SPA
// ==============================
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==============================
// 🚀 Start
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 KwikSend API running on port ${PORT}`);
});
