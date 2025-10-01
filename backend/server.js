const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir le dossier public
app.use(express.static(path.join(__dirname, "../public")));

// Route principale
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Lancer le serveur (Railway a besoin du 0.0.0.0)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});