const express = require("express");
const path = require("path");
const app = express();

// Railway donne automatiquement le PORT
const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "../public")));

// Route pour la racine "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Lancer le serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});