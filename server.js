const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, "public")));

// Route principale
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 KwikSend V2 running on port ${PORT}`);
});