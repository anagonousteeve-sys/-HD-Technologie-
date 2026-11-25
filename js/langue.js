// js/langue.js : bouton FR / EN
// Il doit être chargé APRÈS data.js, services.js et realisations.js (voir index.html)

const boutonLangue = document.getElementById("lang-btn");

// ---------- 1. Les textes fixes du site (ceux écrits dans index.html) ----------
// La clé (ex. "menu.services") correspond à l'attribut data-i18n de index.html
const dictionnaire = {
  fr: {
    "menu.accueil": "Accueil",
    "menu.services": "Services",
    "menu.realisations": "Réalisations",
    "menu.apropos": "À propos",
    "menu.contact": "Contact",
    "hero.texte": "Réseau, sécurité, domotique, énergie renouvelable : à Bohicon et Cotonou.",
    "hero.devis": "Demander un devis",
    "hero.appeler": "Nous appeler",
    "titre.services": "Nos services",
    "titre.realisations": "Nos réalisations",
    "titre.apropos": "À propos",
    "titre.contact": "Contact",
    "footer.copy": "© 2026 HD TECHNOLOGIE. Tous droits réservés."
  },
  en: {
    "menu.accueil": "Home",
    "menu.services": "Services",
    "menu.realisations": "Projects",
    "menu.apropos": "About",
    "menu.contact": "Contact",
    "hero.texte": "Networks, security, home automation, renewable energy: in Bohicon and Cotonou.",
    "hero.devis": "Request a quote",
    "hero.appeler": "Call us",
    "titre.services": "Our services",
    "titre.realisations": "Our projects",
    "titre.apropos": "About",
    "titre.contact": "Contact",
    "footer.copy": "© 2026 HD TECHNOLOGIE. All rights reserved."
  }
};

// ---------- 2. Mémoriser le choix (le navigateur le garde même après fermeture) ----------
function lireChoix() {
  try { return localStorage.getItem("langue"); } catch (e) { return null; }
}

function sauverChoix(valeur) {
  try { localStorage.setItem("langue", valeur); } catch (e) { /* navigation privée : on ignore */ }
}

// ---------- 3. Remplacer les textes marqués data-i18n ----------
function appliquerTextes() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const texte = dictionnaire[langue][el.getAttribute("data-i18n")];
    if (texte) el.textContent = texte;
  });
  document.documentElement.lang = langue;                        // <html lang="..."> suit la langue
  if (boutonLangue) {
    boutonLangue.textContent = langue === "fr" ? "EN" : "FR";    // le bouton propose l'autre langue
  }
}

// ---------- 4. Le slogan (vient de la base, table reglages) ----------
async function appliquerSlogan() {
  const reglages = await chargerReglages();
  const slogan = reglages.slogan;
  if (!slogan) return;
  const texte = slogan["valeur_" + langue] || slogan.valeur_fr;
  if (!texte) return;
  document.querySelectorAll(".slogan, .footer-slogan").forEach((el) => {
    el.textContent = texte;
  });
}

// ---------- 5. Redessiner ce qui vient de la base ----------
async function redessiner() {
  afficherServices(await chargerServices(), langue);
  afficherRealisations(await chargerRealisations(), langue);
  appliquerSlogan();
}

// ---------- 6. Démarrage ----------
// On reprend le choix précédent, sinon le français.
// Cette ligne s'exécute avant le dessin des cartes : elles s'afficheront dans la bonne langue.
langue = lireChoix() === "en" ? "en" : "fr";
appliquerTextes();

if (boutonLangue) {
  boutonLangue.addEventListener("click", () => {
    langue = langue === "fr" ? "en" : "fr";   // "fr" devient "en", et inversement
    sauverChoix(langue);
    appliquerTextes();
    redessiner();
  });
}