const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Test route racine
app.get("/", (req, res) => {
  res.send("✅ KwikSend backend is running on Railway!");
});

app.listen(PORT, () => {
  console.log(`🚀 KwikSend running on port ${PORT}`);
});