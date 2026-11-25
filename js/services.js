// js/services.js : fabrique les cartes de services
function afficherServices(services, langue) {
  const zone = document.getElementById("services-grid");
  if (!zone) return;
  if (!services.length) return;          // pas de données : on garde les cartes écrites à la main

  zone.innerHTML = "";

  services.forEach((s) => {
    const carte = document.createElement("article");
    carte.className = "service-card";

    const icone = document.createElement("div");
    icone.className = "service-icon";
    icone.setAttribute("data-icone", s.icone || "");

    const titre = document.createElement("h3");
    titre.className = "service-title";
    titre.textContent = s["titre_" + langue] || s.titre_fr;

    const texte = document.createElement("p");
    texte.className = "service-text";
    texte.textContent = s["description_" + langue] || s.description_fr || "";

    carte.append(icone, titre, texte);
    zone.appendChild(carte);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  afficherServices(await chargerServices(), langue);
});