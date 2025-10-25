#!/bin/bash
# ===========================================
# 🚀 Script automatique de push Git pour KwikSend-V2
# ===========================================

echo "🟢 Lancement du push KwikSend-V2 vers GitHub..."

# Aller dans le dossier du projet (modifie le chemin si besoin)
cd "$(dirname "$0")"

# Étapes Git
git add .
git commit -m "Mise à jour automatique du site KwikSend-V2"
git pull origin main --rebase
git push origin main

echo "✅ Push effectué avec succès vers GitHub !"
