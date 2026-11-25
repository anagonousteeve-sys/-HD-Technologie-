// js/reglages.js : applique les infos modifiables par l'admin
document.addEventListener("DOMContentLoaded", async () => {
  const reglages = await chargerReglages();

  // Lien WhatsApp : seulement des chiffres (sécurité)
  const wa = reglages.whatsapp && reglages.whatsapp.valeur_fr;
  if (wa && /^[0-9]{8,15}$/.test(wa)) {
    document.querySelectorAll(".btn-whatsapp").forEach((a) => {
      a.href = "https://wa.me/" + wa;
    });
  }

  // Slogan (dans la langue choisie, sinon le français)
  const slogan = reglages.slogan;
  if (slogan) {
    const texte = slogan["valeur_" + langue] || slogan.valeur_fr;
    document.querySelectorAll(".slogan, .footer-slogan").forEach((p) => {
      p.textContent = texte;
    });
  }
});