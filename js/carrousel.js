// js/carrousel.js : défilement des cartes de réalisations
// - flèches précédent / suivant
// - défilement automatique lent
// - pause quand la souris est dessus, quand on touche l'écran ou quand la modale est ouverte
// realisations.js appelle initialiserCarrousel() après avoir fabriqué les cartes.

(function () {
  const DELAI_AUTO = 4000;     // millisecondes entre deux défilements : un nombre plus grand = plus lent

  let minuteur = null;         // le chronomètre du défilement automatique
  let ecouteursPrets = false;  // les écouteurs ne doivent être ajoutés qu'une seule fois
  let enPause = false;         // true quand on survole ou touche le carrousel

  function piste() {
    return document.getElementById("realisations-grid");
  }

  // Les cartes dépassent-elles de la zone visible ? (sinon : ni flèches, ni défilement)
  function aBesoinDeDefiler() {
    const p = piste();
    return !!p && p.scrollWidth > p.clientWidth + 5;
  }

  // Distance d'un défilement = largeur d'une carte + espace entre deux cartes
  function largeurPas() {
    const p = piste();
    const carte = p.querySelector(".realisation-card");
    if (!carte) return 0;
    const espace = parseFloat(getComputedStyle(p).columnGap) || 0;
    return carte.getBoundingClientRect().width + espace;
  }

  // sens = 1 : vers la droite, -1 : vers la gauche. Au bout, on boucle.
  function defiler(sens) {
    const p = piste();
    if (!p) return;
    const fin = p.scrollWidth - p.clientWidth;   // position tout à droite
    if (sens > 0 && p.scrollLeft >= fin - 5) {
      p.scrollTo({ left: 0, behavior: "smooth" });        // au bout : retour au début
    } else if (sens < 0 && p.scrollLeft <= 5) {
      p.scrollTo({ left: fin, behavior: "smooth" });      // au début : saut à la fin
    } else {
      p.scrollBy({ left: sens * largeurPas(), behavior: "smooth" });
    }
  }

  function majFleches() {
    const visible = aBesoinDeDefiler();
    const precedent = document.querySelector(".carousel-prev");
    const suivant = document.querySelector(".carousel-next");
    if (precedent) precedent.hidden = !visible;
    if (suivant) suivant.hidden = !visible;
  }

  function modaleOuverte() {
    const m = document.getElementById("modale");
    return !!m && !m.hidden;
  }

  function arreterAuto() {
    if (minuteur) {
      clearInterval(minuteur);
      minuteur = null;
    }
  }

  function demarrerAuto() {
    arreterAuto();
    if (!aBesoinDeDefiler()) return;
    // Si la personne a demandé moins d'animations dans son système : pas de défilement automatique
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    minuteur = setInterval(() => {
      if (!enPause && !document.hidden && !modaleOuverte()) defiler(1);
    }, DELAI_AUTO);
  }

  function preparerEcouteurs() {
    const zone = document.querySelector(".carousel");
    const precedent = document.querySelector(".carousel-prev");
    const suivant = document.querySelector(".carousel-next");
    if (!zone || !precedent || !suivant) return;
    ecouteursPrets = true;

    // Flèches : on défile, puis on relance le chronomètre pour ne pas bouger aussitôt après
    precedent.addEventListener("click", () => { defiler(-1); demarrerAuto(); });
    suivant.addEventListener("click", () => { defiler(1); demarrerAuto(); });

    // Pause : souris dessus, clavier dedans, doigt sur l'écran
    zone.addEventListener("mouseenter", () => { enPause = true; });
    zone.addEventListener("mouseleave", () => { enPause = false; });
    zone.addEventListener("focusin", () => { enPause = true; });
    zone.addEventListener("focusout", () => { enPause = false; });
    zone.addEventListener("touchstart", () => { enPause = true; }, { passive: true });
    zone.addEventListener("touchend", () => {
      setTimeout(() => { enPause = false; }, 5000);   // on reprend 5 secondes après
    }, { passive: true });

    // Si la fenêtre change de taille, on recalcule les flèches
    window.addEventListener("resize", majFleches);
  }

  // Appelée par realisations.js après chaque (re)dessin des cartes
  function initialiserCarrousel() {
    const p = piste();
    if (!p) return;
    p.scrollLeft = 0;
    majFleches();
    demarrerAuto();
    if (!ecouteursPrets) preparerEcouteurs();
  }

  window.initialiserCarrousel = initialiserCarrousel;
})();