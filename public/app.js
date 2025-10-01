// ============================
// 🔹 Utilities
// ============================
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

function showToast(msg, type = "info") {
  alert(`[${type.toUpperCase()}] ${msg}`); // 👉 tu pourras remplacer par un vrai toast UI
}

// ============================
// 🔹 SPA Navigation
// ============================
const views = {
  "/": "view-home",
  "/wallet": "view-wallet",
  "/send": "view-send",
  "/receive": "view-receive",
  "/history": "view-history",
};

function showView(pathname) {
  const id = views[pathname] || views["/"];
  qsa(".view").forEach((v) => v.classList.remove("active"));
  qs(`#${id}`).classList.add("active");

  // Hooks
  if (id === "view-wallet") loadWallet();
  if (id === "view-history") loadHistoryFull();
}

function navigate(to) {
  history.pushState({}, "", to);
  showView(to);
}

// intercept navigation links
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (a) {
    e.preventDefault();
    navigate(a.getAttribute("href"));
  }
});

// browser back/forward
window.addEventListener("popstate", () => showView(location.pathname));

// ============================
// 🔹 API Helpers
// ============================
async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("API GET " + path);
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ============================
// 🔹 Wallet & History
// ============================
async function loadWallet() {
  try {
    const json = await apiGet("/api/wallet");
    if (!json.success) throw new Error("Wallet error");
    const w = json.wallet;
    qs("#w-name").textContent = w.name;
    qs("#w-balance").textContent = `${w.balance.toFixed(2)} ${w.currency}`;
    qs("#w-currency").textContent = w.currency;

    // mini-history on wallet page
    const list = qs("#history-list");
    list.innerHTML = "";
    w.history.slice(0, 3).forEach((tx) => {
      const el = document.createElement("div");
      el.className = "tx";
      el.innerHTML = `<div><strong>${tx.type.toUpperCase()}</strong> — ${tx.amount} ${w.currency}</div>
                      <div class="muted small">${new Date(tx.date).toLocaleString()}</div>`;
      list.appendChild(el);
    });
  } catch (e) {
    console.error(e);
    qs("#w-name").textContent = "Erreur wallet";
  }
}

async function loadHistoryFull() {
  try {
    const json = await apiGet("/api/wallet");
    const list = qs("#history-full-list");
    list.innerHTML = "";
    json.wallet.history.forEach((tx) => {
      const el = document.createElement("div");
      el.className = "tx";
      el.innerHTML = `<div><strong>${tx.type.toUpperCase()}</strong> — ${tx.amount} ${json.wallet.currency}</div>
                      <div class="muted small">${new Date(tx.date).toLocaleString()}</div>`;
      list.appendChild(el);
    });
  } catch (e) {
    qs("#history-full-list").textContent = "Impossible de charger l'historique";
  }
}

// ============================
// 🔹 Envoi d’argent
// ============================
async function handleSend(ev) {
  ev.preventDefault();
  const form = ev.target;
  const data = {
    to: form.to.value.trim(),
    amount: parseFloat(form.amount.value),
    currency: form.currency.value,
    note: form.note.value.trim(),
  };
  qs("#send-result").textContent = "⏳ Envoi en cours...";
  try {
    const json = await apiPost("/api/send", data);
    if (!json.success) {
      qs("#send-result").textContent = `Erreur: ${json.message}`;
    } else {
      qs("#send-result").textContent = "✅ Transaction simulée";
      loadWallet();
      loadHistoryFull();
      navigate("/wallet");
    }
  } catch (err) {
    qs("#send-result").textContent = "❌ Erreur réseau";
  }
}

// ============================
// 🔹 Auth simulation
// ============================
let currentUser = JSON.parse(localStorage.getItem("kwik-user")) || null;

function updateAuthUI() {
  const logged = !!currentUser;
  qs("#btn-open-login").style.display = logged ? "none" : "inline-block";
  qs("#btn-open-signup").style.display = logged ? "none" : "inline-block";
  if (logged) {
    showToast(`Connecté en tant que ${currentUser.email}`);
  }
}

// --- login ---
function simulateLogin(email, pass) {
  // Simulation simple
  currentUser = { email, token: "fake-jwt-token" };
  localStorage.setItem("kwik-user", JSON.stringify(currentUser));
  updateAuthUI();
  closeModal("#modal-login");
  showToast("Connexion réussie ✅", "success");
}

// --- signup ---
function simulateSignup(name, email, pass) {
  currentUser = { email, name, token: "fake-jwt-token" };
  localStorage.setItem("kwik-user", JSON.stringify(currentUser));
  updateAuthUI();
  closeModal("#modal-signup");
  showToast("Compte créé ✅", "success");
}

// --- forgot ---
function simulateForgot(email) {
  showToast("Lien de réinitialisation envoyé à " + email, "info");
  closeModal("#modal-forgot");
}

// --- 2FA simulation ---
function simulate2FA(code) {
  if (code === "123456") {
    closeModal("#modal-2fa");
    showToast("2FA validé ✅", "success");
  } else {
    showToast("Code invalide ❌", "error");
  }
}

// ============================
// 🔹 Modals
// ============================
function openModal(id) {
  qs(id).hidden = false;
  qs("#modal-root").classList.add("active");
}
function closeModal(id) {
  if (id) qs(id).hidden = true;
  else qsa(".modal").forEach((m) => (m.hidden = true));
  qs("#modal-root").classList.remove("active");
}

// close buttons
document.addEventListener("click", (e) => {
  if (e.target.dataset.close !== undefined) {
    closeModal();
  }
  if (e.target === qs("#modal-root")) {
    closeModal();
  }
});

// ============================
// 🔹 DOM Ready
// ============================
document.addEventListener("DOMContentLoaded", () => {
  // Navigation CTA
  qs("#go-wallet")?.addEventListener("click", () => navigate("/wallet"));
  qs("#btn-go-send")?.addEventListener("click", () => navigate("/send"));
  qs("#btn-go-receive")?.addEventListener("click", () => navigate("/receive"));

  // Send form
  qs("#send-form")?.addEventListener("submit", handleSend);
  qs("#send-cancel")?.addEventListener("click", () => navigate("/wallet"));

  // Auth modals
  qs("#btn-open-login")?.addEventListener("click", () => openModal("#modal-login"));
  qs("#btn-open-signup")?.addEventListener("click", () => openModal("#modal-signup"));
  qs("#btn-forgot")?.addEventListener("click", () => {
    closeModal("#modal-login");
    openModal("#modal-forgot");
  });

  // Auth forms
  qs("#login-form")?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    simulateLogin(ev.target.email.value, ev.target.password.value);
    openModal("#modal-2fa"); // active 2FA après login
  });
  qs("#signup-form")?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    simulateSignup(ev.target.name.value, ev.target.email.value, ev.target.password.value);
    openModal("#modal-2fa"); // active 2FA après création
  });
  qs("#forgot-form")?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    simulateForgot(ev.target.email.value);
  });
  qs("#form-2fa")?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    simulate2FA(ev.target.code.value);
  });
  qs("#resend-2fa")?.addEventListener("click", () => showToast("Code renvoyé 🔄", "info"));

  // Wallet refresh
  qs("#btn-refresh")?.addEventListener("click", loadWallet);

  // Region switch
  qs("#region")?.addEventListener("change", (ev) => {
    const region = ev.target.value;
    showToast("Interface adaptée pour " + region, "info");
    // Ici tu pourrais adapter les fonctionnalités
  });

  // init
  updateAuthUI();
  showView(location.pathname);
});
