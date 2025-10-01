const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques depuis le dossier "public"
app.use(express.static(path.join(__dirname, "public")));

// Route racine
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fallback : si jamais aucune route ne correspond
app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

// Lancer le serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 KwikSend V2 running on port ${PORT}`);
});