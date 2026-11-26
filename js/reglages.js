// js/reglages.js : applique les infos modifiables par l'admin (WhatsApp, slogan, contacts)

let reglagesCache = {};   // gardé en mémoire pour pouvoir tout réappliquer quand la langue change

// Valeur d'un réglage dans la langue choisie, sinon en français
function valeurReglage(cle) {
  const r = reglagesCache[cle];
  if (!r) return "";
  return String(r["valeur_" + langue] || r.valeur_fr || "").trim();
}

// Valeur française brute (numéros, email, lien : identiques dans les deux langues)
function valeurBrute(cle) {
  const r = reglagesCache[cle];
  return r && r.valeur_fr ? String(r.valeur_fr).trim() : "";
}

// Sécurité : accepte seulement un lien https vers Facebook, renvoie l'adresse ou null
function lienFacebook(texte) {
  try {
    const u = new URL(texte);
    const ok = u.protocol === "https:" && /(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(u.hostname);
    return ok ? u : null;
  } catch (e) {
    return null;                    // ce n'est pas une adresse valide
  }
}

// Montre une carte de contact avec sa valeur, ou la cache s'il n'y a rien
function afficherCarte(id, valeur, href) {
  const carte = document.getElementById(id);
  if (!carte) return;
  if (!valeur) {
    carte.hidden = true;
    return;
  }
  const zone = carte.querySelector(".contact-valeur");
  if (zone) zone.textContent = valeur;   // textContent : jamais innerHTML
  if (href) carte.href = href;
  carte.hidden = false;
}

// Applique tous les réglages à la page (à rappeler quand la langue change)
function appliquerReglages() {
  // WhatsApp : seulement des chiffres (sécurité)
  const wa = valeurBrute("whatsapp");
  const waOk = /^[0-9]{8,15}$/.test(wa);
  if (waOk) {
    document.querySelectorAll(".btn-whatsapp").forEach((a) => {
      a.href = "https://wa.me/" + wa;
    });
  }
  afficherCarte("contact-whatsapp", waOk ? "+" + wa : "", waOk ? "https://wa.me/" + wa : "");

  // Téléphone
  const tel = valeurBrute("telephone");
  const telOk = /^\+?[0-9][0-9 .()-]{6,20}$/.test(tel);
  let telHref = "";
  if (telOk) {
    let chiffres = tel.replace(/[^0-9+]/g, "");
    if (!chiffres.startsWith("+") && chiffres.startsWith("229")) chiffres = "+" + chiffres;
    telHref = "tel:" + chiffres;
    document.querySelectorAll("[data-lien-appel]").forEach((a) => {
      a.href = telHref;             // le bouton « Nous appeler » de l'accueil suit aussi
    });
  }
  afficherCarte("contact-telephone", telOk ? tel : "", telHref);

  // Email
  const email = valeurBrute("email");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  afficherCarte("contact-email", emailOk ? email : "", emailOk ? "mailto:" + email : "");

  // Facebook : visible seulement si l'admin a mis un lien Facebook valide
  const fb = lienFacebook(valeurBrute("facebook"));
  const fbTexte = fb ? fb.hostname.replace(/^www\./, "") + fb.pathname.replace(/\/$/, "") : "";
  afficherCarte("contact-facebook", fbTexte, fb ? fb.href : "");

  // Horaires (dans la langue choisie, sinon en français)
  afficherCarte("contact-horaires", valeurReglage("horaires"), "");

  // Slogan (dans la langue choisie, sinon le français)
  const slogan = valeurReglage("slogan");
  if (slogan) {
    document.querySelectorAll(".slogan, .footer-slogan").forEach((p) => {
      p.textContent = slogan;
    });
  }
  // À propos : si l'admin a rempli un texte, il remplace celui du dictionnaire
  ["p1", "p2", "p3"].forEach((n) => {
    const texte = valeurReglage("apropos_" + n);
    const el = document.querySelector('[data-i18n="apropos.' + n + '"]');
    if (texte && el) el.textContent = texte;   // textContent : jamais innerHTML
  });

}

document.addEventListener("DOMContentLoaded", async () => {
  reglagesCache = (await chargerReglages()) || {};
  appliquerReglages();
});