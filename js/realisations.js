// js/realisations.js : fabrique les cartes de réalisations

// Règle "tout ou rien" : l'anglais n'est utilisé que si titre ET description sont remplis.
function texteRealisation(r, langue) {
  if (langue === "en" && r.titre_en && r.description_en) {
    return { titre: r.titre_en, description: r.description_en };
  }
  return { titre: r.titre_fr, description: r.description_fr || "" };
}

function libelleStatut(statut, langue) {
  const textes = {
    fr: { en_cours: "En cours", termine: "Terminé" },
    en: { en_cours: "In progress", termine: "Completed" }
  };
  return textes[langue][statut] || "";
}

function afficherRealisations(realisations, langue) {
  const zone = document.getElementById("realisations-grid");
  if (!zone) return;
  zone.innerHTML = "";

  if (!realisations.length) {
    const vide = document.createElement("p");
    vide.textContent = langue === "en" ? "Projects coming soon." : "Nos projets arrivent bientôt.";
    zone.appendChild(vide);
    return;
  }

  realisations.forEach((r) => {
    const t = texteRealisation(r, langue);

    const carte = document.createElement("article");
    carte.className = "realisation-card";

    const image = document.createElement("img");
    image.className = "realisation-img";
    image.src = r.image_url;
    image.alt = t.titre;
    image.loading = "lazy";

    const statut = document.createElement("span");
    statut.className = "realisation-statut";
    statut.setAttribute("data-statut", r.statut);
    statut.textContent = libelleStatut(r.statut, langue);

    const titre = document.createElement("h3");
    titre.className = "realisation-title";
    titre.textContent = t.titre;

    const texte = document.createElement("p");
    texte.className = "realisation-text";
    texte.textContent = t.description;

    carte.append(image, statut, titre, texte);
    zone.appendChild(carte);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  afficherRealisations(await chargerRealisations(), langue);
});