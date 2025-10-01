// Simple SPA router + API calls
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

const views = {
  "/": "view-home",
  "/wallet": "view-wallet",
  "/send": "view-send",
  "/history": "view-history"
};

function showView(pathname){
  const id = views[pathname] || views["/"];
  qsa(".view").forEach(v => v.classList.remove("active"));
  qs(`#${id}`).classList.add("active");
  // special view load hooks
  if (id === "view-wallet") loadWallet();
  if (id === "view-history") loadHistory();
}

function navigate(to){
  history.pushState({}, "", to);
  showView(to);
}

// intercept link clicks
document.addEventListener("click", e => {
  const a = e.target.closest("a[data-link]");
  if (a) {
    e.preventDefault();
    navigate(a.getAttribute("href"));
  }
});

// on popstate (back/forward)
window.addEventListener("popstate", () => showView(location.pathname));

// initial wiring
document.addEventListener("DOMContentLoaded", () => {
  // nav buttons
  qs("#go-wallet").addEventListener("click", () => navigate("/wallet"));
  qs("#btn-go-send")?.addEventListener("click", () => navigate("/send"));
  qs("#btn-refresh")?.addEventListener("click", loadWallet);

  // send form
  const form = qs("#send-form");
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const data = {
      to: form.to.value.trim(),
      amount: parseFloat(form.amount.value),
      note: form.note.value.trim()
    };
    qs("#send-result").textContent = "Envoi en cours...";
    try {
      const r = await fetch("/api/send", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
      });
      const json = await r.json();
      if (!json.success) {
        qs("#send-result").textContent = `Erreur: ${json.message || "inconnue"}`;
      } else {
        qs("#send-result").textContent = "Transaction simulée ✅";
        form.reset();
        loadWallet();
        loadHistory();
        navigate("/wallet");
      }
    } catch (err) {
      qs("#send-result").textContent = "Erreur réseau";
    }
  });

  qs("#send-cancel").addEventListener("click", () => navigate("/wallet"));

  // initial route
  showView(location.pathname);
});

// ----- API helpers -----
async function apiGet(path){
  const res = await fetch(path);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// wallet
async function loadWallet(){
  try {
    const json = await apiGet("/api/wallet");
    if (!json.success) throw new Error("wallet err");
    const w = json.wallet;
    qs("#w-name").textContent = w.name;
    qs("#w-balance").textContent = `${w.balance.toFixed(2)} ${w.currency}`;
    qs("#w-currency").textContent = "";
  } catch (e) {
    qs("#w-name").textContent = "Erreur de chargement";
    qs("#w-balance").textContent = "—";
  }
}

// history
async function loadHistory(){
  try {
    const json = await apiGet("/api/wallet");
    const list = qs("#history-list");
    list.innerHTML = "";
    json.wallet.history.forEach(tx => {
      const el = document.createElement("div");
      el.className = "tx";
      el.innerHTML = `<div><strong>${tx.type.toUpperCase()}</strong> — ${tx.amount} ${json.wallet.currency}</div>
                      <div class="muted">${new Date(tx.date).toLocaleString()}</div>`;
      list.appendChild(el);
    });
  } catch (e) {
    qs("#history-list").textContent = "Impossible de charger l'historique.";
  }
}
