// ==============================
// 🍔 Menu Mobile
// ==============================
function toggleMenu() {
  const menu = document.getElementById("nav-menu");
  const burger = document.querySelector(".burger");
  if (menu) menu.classList.toggle("open");
  if (burger) burger.classList.toggle("active");
}

// ==============================
// 🌙 Dark Mode
// ==============================
const darkToggle = document.getElementById("darkToggle");
if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    darkToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    if (darkToggle) darkToggle.textContent = "☀️";
  }
});
// Modal Alimenter / Retirer
window.openMoveFundsModal = function(){
  document.getElementById("moveFundsModal").style.display="flex";
  chosenMethod = null;
  document.getElementById("confirmMove").disabled = true;
}

window.closeMoveFundsModal = function(){
  document.getElementById("moveFundsModal").style.display="none";
}

let chosenMethod = null;

// clic sur méthode
document.querySelectorAll(".methodBtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".methodBtn").forEach(b=>b.style.background="");
    btn.style.background="#ffe5d0";
    chosenMethod = btn.dataset.method;
    document.getElementById("confirmMove").disabled = false;
  });
});

// confirmer
document.getElementById("confirmMove").addEventListener("click", ()=>{
  const action = document.querySelector("input[name='moveAction']:checked").value;
  if(!chosenMethod) return alert("Choisissez une méthode");
  // redirection simulée
  if(action==="fund"){
    window.location.href = chosenMethod+"-fund.html";
  } else {
    window.location.href = chosenMethod+"-withdraw.html";
  }
});
