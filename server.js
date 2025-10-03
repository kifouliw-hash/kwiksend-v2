const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire les formulaires JSON & URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connexion DB Render
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Routes statiques (public/)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/connexion", (req, res) => res.sendFile(path.join(__dirname, "public", "connexion.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// === ROUTE INSCRIPTION ===
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérif si email déjà utilisé
    const check = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hash du mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // Insertion en BDD
    const result = await db.query(
      "INSERT INTO users (firstname, email, password_hash) VALUES ($1, $2, $3) RETURNING id, firstname, email",
      [name, email, hashed]
    );

    const user = result.rows[0];
    res.json({ message: "✅ Inscription réussie !", user });
  } catch (err) {
    console.error("Erreur register:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// === ROUTE CONNEXION ===
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérif si utilisateur existe
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email inconnu" });
    }

    const user = result.rows[0];

    // Vérif du mot de passe
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Réponse avec les infos utilisateur
    res.json({ 
      message: "✅ Connexion réussie", 
      user: { id: user.id, name: user.firstname, email: user.email } 
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Lancer le serveur
app.listen(PORT, () => console.log(`🚀 KwikSend running on port ${PORT}`));