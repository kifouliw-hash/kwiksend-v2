const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- In-memory simulated data (for demo) ---
let wallet = {
  id: "demo-001",
  name: "KwikSend Demo Wallet",
  balance: 1250.50,
  currency: "USD",
  history: [
    { id: "h1", type: "receive", amount: 500, date: Date.now() - 1000 * 60 * 60 * 24 },
    { id: "h2", type: "send", amount: 50, date: Date.now() - 1000 * 60 * 60 * 2 }
  ]
};

// Health
app.get("/healthz", (req, res) => res.json({ ok: true }));

// API: get wallet
app.get("/api/wallet", (req, res) => {
  res.json({ success: true, wallet });
});

// API: send (simulate)
app.post("/api/send", (req, res) => {
  const { to, amount, note } = req.body || {};
  if (!to || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }
  if (amount > wallet.balance) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  // simulate processing
  wallet.balance = +(wallet.balance - amount).toFixed(2);
  const entry = { id: `tx-${Date.now()}`, type: "send", amount, to, note: note || "", date: Date.now() };
  wallet.history.unshift(entry);

  // fake response
  return res.json({
    success: true,
    message: "Transaction simulated",
    tx: entry,
    wallet
  });
});

// SPA fallback (serve index.html for client-side routing)
app.get("*", (req, res) => {
  // if request looks like API, return 404
  if (req.path.startsWith("/api/") || req.path === "/healthz") {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start
app.listen(PORT, () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});
