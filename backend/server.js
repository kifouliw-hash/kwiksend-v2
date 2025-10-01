const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Dossier public pour tes fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

// Route racine -> renvoie bien index.html
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});