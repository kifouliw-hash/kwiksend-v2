// Gérer les vues
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

// Simuler portefeuille
let wallet = { balance: 20000, currency: "XOF", history: [] };

function updateWallet() {
  document.getElementById("balance").innerText = wallet.balance + " FCFA";
  document.getElementById("balance-eur").innerText = "≈ " + (wallet.balance / 650).toFixed(2) + " EUR";

  let h = document.getElementById("history");
  h.innerHTML = "";
  wallet.history.forEach(op => {
    let li = document.createElement("li");
    li.innerText = `${op.type} ${op.amount} ${op.currency} via ${op.channel}`;
    h.appendChild(li);
  });
}

function topupWallet() {
  wallet.balance += 5000;
  wallet.history.push({ type: "Top-up", amount: 5000, currency: "XOF", channel: "Mobile" });
  updateWallet();
}

function simulateTransfer(e) {
  e.preventDefault();
  let montant = parseInt(document.getElementById("montant").value);
  let channel = document.getElementById("channel").value;

  if (montant > wallet.balance) {
    document.getElementById("result").innerText = "❌ Solde insuffisant";
    return;
  }

  wallet.balance -= montant;
  wallet.history.push({ type: "Transfert", amount: montant, currency: "XOF", channel });
  updateWallet();
  document.getElementById("result").innerText = `✅ Transfert de ${montant} FCFA via ${channel}`;
}

// Initialiser portefeuille
updateWallet();