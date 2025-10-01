const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques (css, js, images) depuis le dossier public
app.use(express.static(path.join(__dirname, "public")));

// Route pour la racine → envoyer index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});