const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Simulation d'un portefeuille
let wallet = {
  id: uuidv4(),
  owner: "Awa Diop",
  balance: 20000,
  currency: "XOF",
  history: [
    { id: uuidv4(), type: "recharge", amount: 10000, channel: "Orange Money" },
    { id: uuidv4(), type: "iban", amount: 25, channel: "IBAN" }
  ]
};

// 🔹 Endpoint pour récupérer le portefeuille
app.get("/api/wallet", (req, res) => {
  res.json(wallet);
});

// 🔹 Endpoint pour recharger
app.post("/api/wallet/recharge", (req, res) => {
  const { amount, channel } = req.body;
  wallet.balance += amount;
  wallet.history.push({ id: uuidv4(), type: "recharge", amount, channel });
  res.json(wallet);
});

// 🔹 Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ KwikSend Backend running on http://localhost:${PORT}`);
});