const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Servir tous les fichiers statiques depuis public/
app.use(express.static(path.join(__dirname, "public")));

// Routes principales (tu en ajoutes si nécessaire)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/connexion", (req, res) => res.sendFile(path.join(__dirname, "public", "connexion.html")));
app.get("/attente", (req, res) => res.sendFile(path.join(__dirname, "public", "attente.html")));
app.get("/portefeuille", (req, res) => res.sendFile(path.join(__dirname, "public", "portefeuille.html")));
app.get("/transferts", (req, res) => res.sendFile(path.join(__dirname, "public", "transferts.html")));
app.get("/kwiktransfert", (req, res) => res.sendFile(path.join(__dirname, "public", "kwiktransfert.html")));
app.get("/mobile", (req, res) => res.sendFile(path.join(__dirname, "public", "mobile.html")));
app.get("/recevoir", (req, res) => res.sendFile(path.join(__dirname, "public", "recevoir.html")));
app.get("/retrait", (req, res) => res.sendFile(path.join(__dirname, "public", "retrait.html")));

app.listen(PORT, () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});
