const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 8000;

// Chemin vers le dossier public (depuis backend)
const publicPath = path.join(__dirname, "../public");

// Servir les fichiers statiques
app.use(express.static(publicPath));

// Route pour la racine
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});