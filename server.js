// server.js - KwikSend demo API (in-memory, for Render demo)
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- In-memory stores (demo) ----------
const users = {};   // users[email] = { name, email, passwordHash, token, pending2fa, wallet }
                   // wallet: { id, balance, currency, history: [] }

// Helper: create demo wallet
function createDemoWallet() {
  return {
    id: uuidv4(),
    balance: 1250.50,
    currency: "USD",
    history: [
      { id: uuidv4(), type: "receive", amount: 500, date: Date.now() - 1000 * 60 * 60 * 24 },
      { id: uuidv4(), type: "send", amount: 50, date: Date.now() - 1000 * 60 * 60 * 2 },
    ],
  };
}

// Helper: generate 6-digit code
function generate2FACode() {
  return ("" + Math.floor(100000 + Math.random() * 900000));
}

// Helper: generate token (fake JWT for demo)
function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Middleware: require auth
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });
  const token = auth.split(" ")[1];
  const user = Object.values(users).find(u => u.token === token);
  if (!user) return res.status(401).json({ success: false, message: "Invalid token" });
  req.user = user;
  next();
}

// ---------------- Routes ----------------

// Health check
app.get("/healthz", (req, res) => res.json({ ok: true }));

// Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "Missing fields" });
  const lc = email.toLowerCase();
  if (users[lc]) return res.status(400).json({ success: false, message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const twofa = generate2FACode();

  users[lc] = {
    name,
    email: lc,
    passwordHash,
    token: null,
    pending2fa: twofa,
    wallet: createDemoWallet()
  };

  // Simulate sending 2FA (for demo we return code in response)
  console.log(`[DEMO] 2FA for signup ${lc}: ${twofa}`);
  return res.json({ success: true, require2fa: true, message: "Code 2FA envoyé (demo)", demo2fa: twofa });
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: "Missing fields" });
  const lc = email.toLowerCase();
  const user = users[lc];
  if (!user) return res.status(400).json({ success: false, message: "User not found" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const twofa = generate2FACode();
  user.pending2fa = twofa;
  console.log(`[DEMO] 2FA for login ${lc}: ${twofa}`);
  return res.json({ success: true, require2fa: true, message: "Code 2FA envoyé (demo)", demo2fa: twofa });
});

// 2FA validate
app.post("/api/2fa", (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ success: false, message: "Missing fields" });
  const lc = email.toLowerCase();
  const user = users[lc];
  if (!user || !user.pending2fa) return res.status(400).json({ success: false, message: "No pending 2FA" });
  if (user.pending2fa !== String(code)) return res.status(401).json({ success: false, message: "Invalid 2FA code" });

  // OK: generate token and clear pending2fa
  user.token = generateToken();
  delete user.pending2fa;

  return res.json({
    success: true,
    message: "2FA validé",
    token: user.token,
    wallet: user.wallet,
    user: { email: user.email, name: user.name }
  });
});

// Logout
app.post("/api/logout", requireAuth, (req, res) => {
  req.user.token = null;
  return res.json({ success: true, message: "Logged out" });
});

// Get wallet (protected)
app.get("/api/wallet", requireAuth, (req, res) => {
  return res.json({ success: true, wallet: req.user.wallet });
});

// Send (protected)
app.post("/api/send", requireAuth, (req, res) => {
  const { to, amount, currency, note } = req.body || {};
  if (!to || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  // simple balance check
  if (amount > req.user.wallet.balance) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  // debit sender
  req.user.wallet.balance = +(req.user.wallet.balance - amount).toFixed(2);
  const entry = { id: uuidv4(), type: "send", amount, to, note: note || "", date: Date.now() };
  req.user.wallet.history.unshift(entry);

  // If recipient is a KwikSend demo user (same platform), credit them
  const recip = users[String(to).toLowerCase()];
  if (recip) {
    recip.wallet.balance = +(recip.wallet.balance + amount).toFixed(2);
    const rEntry = { id: uuidv4(), type: "receive", amount, from: req.user.email, date: Date.now() };
    recip.wallet.history.unshift(rEntry);
  }

  return res.json({ success: true, message: "Transaction completed (demo)", tx: entry, wallet: req.user.wallet });
});

// SPA fallback: serve index.html for client-side routes (but keep API routes above)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path === "/healthz") {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start
app.listen(PORT, () => {
  console.log(`🚀 KwikSend demo API running on port ${PORT}`);
});
