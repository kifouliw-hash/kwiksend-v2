// ==============================
// 🌐 Gestion des traductions
// ==============================
function switchLang(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations(lang);
}

function applyTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.documentElement.lang = lang;
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "fr";
  const langSwitcher = document.getElementById("langSwitcher");
  if (langSwitcher) langSwitcher.value = savedLang;
  applyTranslations(savedLang);
});
