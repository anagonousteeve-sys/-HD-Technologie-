// js/langue.js : bouton FR / EN
// Il doit être chargé APRÈS data.js, reglages.js, services.js et realisations.js (voir index.html)

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
    "contact.intro": "Une question, un projet ? Contactez-nous.",
    "contact.telephone": "Téléphone",
    "contact.email": "Email",
    "contact.horaires": "Horaires",
    "devis.titre": "Demander un devis",
    "devis.nom": "Votre nom",
    "devis.telephone": "Votre téléphone",
    "devis.service": "Service souhaité",
    "devis.choisir": "Choisir un service",
    "devis.s.reseau": "Réseau et télécommunications",
    "devis.s.video": "Vidéosurveillance",
    "devis.s.securite": "Sécurité",
    "devis.s.domotique": "Domotique",
    "devis.s.energie": "Énergie renouvelable",
    "devis.s.dev": "Développement web et logiciel",
    "devis.ville": "Ville",
    "devis.besoin": "Décrivez votre besoin",
    "devis.envoyer": "Envoyer sur WhatsApp",
    "apropos.p1": "HD TECHNOLOGIE est une entreprise spécialisée dans le réseau informatique et les télécommunications, basée à Bohicon et à Cotonou. Son slogan résume sa vision : « Connectons le monde autrement ».",
    "apropos.p2": "Autour du réseau, l'entreprise propose aussi la vidéosurveillance, la sécurité, la domotique, l'énergie renouvelable et le développement web et logiciel.",
    "apropos.p3": "Particulier ou structure, vous pouvez la contacter pour étudier votre projet et obtenir un devis.",
    "apropos.pt1": "domaines d'expertise",
    "apropos.pt2": "villes",
    "apropos.pt3t": "Devis",
    "apropos.pt3": "sur demande",
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
    "contact.intro": "A question or a project? Get in touch.",
    "contact.telephone": "Phone",
    "contact.email": "Email",
    "contact.horaires": "Opening hours",
    "devis.titre": "Request a quote",
    "devis.nom": "Your name",
    "devis.telephone": "Your phone number",
    "devis.service": "Service needed",
    "devis.choisir": "Choose a service",
    "devis.s.reseau": "Networks and telecommunications",
    "devis.s.video": "Video surveillance",
    "devis.s.securite": "Security",
    "devis.s.domotique": "Home automation",
    "devis.s.energie": "Renewable energy",
    "devis.s.dev": "Web and software development",
    "devis.ville": "City",
    "devis.besoin": "Describe your need",
    "devis.envoyer": "Send on WhatsApp",
    "apropos.p1": "HD TECHNOLOGIE is a company specialized in computer networking and telecommunications, based in Bohicon and Cotonou. Its motto sums up its vision: “Connecting the world differently.”",
    "apropos.p2": "Alongside networking, the company also offers video surveillance, security, home automation, renewable energy, and web and software development.",
    "apropos.p3": "Whether you are an individual or an organization, you can contact the company to discuss your project and get a quote.",
    "apropos.pt1": "areas of expertise",
    "apropos.pt2": "cities",
    "apropos.pt3t": "Quote",
    "apropos.pt3": "on request",
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

// ---------- 4. Redessiner ce qui vient de la base ----------
// (le slogan, les contacts et les horaires sont gérés par appliquerReglages(), dans reglages.js)
async function redessiner() {
  afficherServices(await chargerServices(), langue);
  afficherRealisations(await chargerRealisations(), langue);
  appliquerReglages();
}

// ---------- 5. Démarrage ----------
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