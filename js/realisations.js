// js/realisations.js : fabrique les cartes de réalisations (carrousel + modale)

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
  } else {
    realisations.forEach((r) => {
      const t = texteRealisation(r, langue);
      const couverture = (r.images && r.images[0]) || r.image_url;   // seule la 1re image sur la carte

      const carte = document.createElement("article");
      carte.className = "realisation-card";
      carte.setAttribute("tabindex", "0");

      const image = document.createElement("img");
      image.className = "realisation-img";
      image.src = couverture;
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

      // Clic ou clavier (Entrée / Espace) : ouvre la modale (modale.js)
      const ouvrir = () => {
        if (typeof ouvrirRealisation === "function") ouvrirRealisation(r, langue);
      };
      carte.addEventListener("click", ouvrir);
      carte.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ouvrir();
        }
      });

      zone.appendChild(carte);
    });
  }

  // Une fois les cartes fabriquées : (ré)initialiser le carrousel (carrousel.js)
  if (typeof initialiserCarrousel === "function") initialiserCarrousel();
}

document.addEventListener("DOMContentLoaded", async () => {
  afficherRealisations(await chargerRealisations(), langue);
});