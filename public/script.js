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