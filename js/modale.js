// js/modale.js : fenêtre (modale) d'une réalisation : galerie + texte + visionneuse
// Fournit la fonction globale ouvrirRealisation(r, langue), appelée par realisations.js

(function () {
  const modale = document.getElementById("modale");
  if (!modale) return;   // page sans modale : on ne fait rien

  const fond = modale.querySelector(".modale-fond");
  const contenu = modale.querySelector(".modale-contenu");
  const btnFermer = modale.querySelector(".modale-fermer");
  const galerie = modale.querySelector(".modale-galerie");
  const statut = modale.querySelector(".modale-statut");
  const titre = document.getElementById("modale-titre");
  const texte = document.getElementById("modale-texte");

  const DELAI_AUTO = 4000;   // 4 secondes entre deux images
  const reduireAnimations = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let images = [];          // les URL des images de la réalisation ouverte
  let index = 0;            // numéro de l'image affichée
  let titreCourant = "";
  let declencheur = null;   // l'élément qui a ouvert la modale (pour lui rendre le focus)
  let langueCourante = "fr";
  let minuteur = null;      // le défilement automatique

  const TEXTES = {
    fr: { fermer: "Fermer", prec: "Image précédente", suiv: "Image suivante", agrandir: "Agrandir l'image" },
    en: { fermer: "Close", prec: "Previous image", suiv: "Next image", agrandir: "Enlarge image" }
  };
  const tr = () => TEXTES[langueCourante] || TEXTES.fr;

  /* ---------- Visionneuse plein écran (créée ici, pas besoin de HTML) ---------- */

  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.hidden = true;
  lb.innerHTML =
    '<button type="button" class="lightbox-fermer">&times;</button>' +
    '<button type="button" class="lightbox-btn lightbox-prec">&#10094;</button>' +
    '<img class="lightbox-image" alt="">' +
    '<button type="button" class="lightbox-btn lightbox-suiv">&#10095;</button>' +
    '<span class="lightbox-compteur"></span>';
  document.body.appendChild(lb);

  const lbFermer = lb.querySelector(".lightbox-fermer");
  const lbPrec = lb.querySelector(".lightbox-prec");
  const lbSuiv = lb.querySelector(".lightbox-suiv");
  const lbImage = lb.querySelector(".lightbox-image");
  const lbCompteur = lb.querySelector(".lightbox-compteur");

  function ouvrirLightbox() {
    arreterAuto();
    lbFermer.setAttribute("aria-label", tr().fermer);
    lbPrec.setAttribute("aria-label", tr().prec);
    lbSuiv.setAttribute("aria-label", tr().suiv);
    const plusieurs = images.length > 1;
    lbPrec.hidden = !plusieurs;
    lbSuiv.hidden = !plusieurs;
    lbCompteur.hidden = !plusieurs;
    lb.hidden = false;
    majLightbox();
    lbFermer.focus();
  }

  function fermerLightbox() {
    if (lb.hidden) return;
    lb.hidden = true;
    lbImage.src = "";
    demarrerAuto();
    const img = galerie.querySelector(".modale-image");
    if (img) img.focus();   // le focus revient sur l'image de la modale
  }

  function majLightbox() {
    lbImage.src = images[index];
    lbImage.alt = titreCourant + " (" + (index + 1) + "/" + images.length + ")";
    lbCompteur.textContent = (index + 1) + " / " + images.length;
  }

  lbFermer.addEventListener("click", fermerLightbox);
  lbPrec.addEventListener("click", () => afficherImage(index - 1));
  lbSuiv.addEventListener("click", () => afficherImage(index + 1));
  // Clic sur le fond noir (pas sur l'image ni les boutons) : ferme la visionneuse
  lb.addEventListener("click", (e) => {
    if (e.target === lb) fermerLightbox();
  });

  // Glisser au doigt dans la visionneuse
  let lbDepartX = null;
  lb.addEventListener("touchstart", (e) => {
    lbDepartX = e.touches[0].clientX;
  }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (lbDepartX === null || images.length < 2) return;
    const diff = e.changedTouches[0].clientX - lbDepartX;
    lbDepartX = null;
    if (Math.abs(diff) > 50) afficherImage(diff < 0 ? index + 1 : index - 1);
  });

  /* ---------- Défilement automatique ---------- */

  function arreterAuto() {
    clearInterval(minuteur);
    minuteur = null;
  }

  function demarrerAuto() {
    arreterAuto();
    if (modale.hidden || images.length < 2 || reduireAnimations) return;
    minuteur = setInterval(() => {
      if (lb.hidden) afficherImage(index + 1);
    }, DELAI_AUTO);
  }

  /* ---------- Galerie ---------- */

  let imgPrincipale, compteur, btnPrec, btnSuiv;

  function construireGalerie() {
    galerie.innerHTML = "";

    imgPrincipale = document.createElement("img");
    imgPrincipale.className = "modale-image";
    imgPrincipale.tabIndex = 0;
    imgPrincipale.setAttribute("role", "button");
    imgPrincipale.setAttribute("aria-label", tr().agrandir);
    imgPrincipale.title = tr().agrandir;
    imgPrincipale.addEventListener("click", ouvrirLightbox);
    imgPrincipale.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        ouvrirLightbox();
      }
    });

    compteur = document.createElement("span");
    compteur.className = "modale-compteur";

    btnPrec = document.createElement("button");
    btnPrec.type = "button";
    btnPrec.className = "modale-btn modale-prec";
    btnPrec.innerHTML = "&#10094;";
    btnPrec.setAttribute("aria-label", tr().prec);
    btnPrec.addEventListener("click", () => afficherImage(index - 1));

    btnSuiv = document.createElement("button");
    btnSuiv.type = "button";
    btnSuiv.className = "modale-btn modale-suiv";
    btnSuiv.innerHTML = "&#10095;";
    btnSuiv.setAttribute("aria-label", tr().suiv);
    btnSuiv.addEventListener("click", () => afficherImage(index + 1));

    galerie.append(imgPrincipale, btnPrec, btnSuiv, compteur);

    // Une seule image : pas de flèches ni de compteur
    const plusieurs = images.length > 1;
    btnPrec.hidden = !plusieurs;
    btnSuiv.hidden = !plusieurs;
    compteur.hidden = !plusieurs;
  }

  function afficherImage(i) {
    index = (i + images.length) % images.length;   // revient au début / à la fin
    imgPrincipale.src = images[index];
    imgPrincipale.alt = titreCourant + " (" + (index + 1) + "/" + images.length + ")";
    compteur.textContent = (index + 1) + " / " + images.length;
    if (!lb.hidden) majLightbox();
    if (minuteur) demarrerAuto();   // après un changement, on repart pour 4 s pleines
  }

  // Pause au survol et au toucher, reprise ensuite
  galerie.addEventListener("mouseenter", arreterAuto);
  galerie.addEventListener("mouseleave", () => { if (lb.hidden) demarrerAuto(); });

  // Glisser au doigt sur la galerie : gauche = suivante, droite = précédente
  let departX = null;
  galerie.addEventListener("touchstart", (e) => {
    departX = e.touches[0].clientX;
    arreterAuto();
  }, { passive: true });

  galerie.addEventListener("touchend", (e) => {
    if (departX !== null && images.length > 1) {
      const diff = e.changedTouches[0].clientX - departX;
      if (Math.abs(diff) > 50) afficherImage(diff < 0 ? index + 1 : index - 1);
    }
    departX = null;
    if (lb.hidden) demarrerAuto();
  });

  /* ---------- Ouvrir ---------- */

  window.ouvrirRealisation = function (r, langue) {
    langueCourante = langue || "fr";
    const t = texteRealisation(r, langueCourante);   // défini dans realisations.js

    images = (r.images && r.images.length) ? r.images : [r.image_url];
    titreCourant = t.titre;
    declencheur = document.activeElement;

    construireGalerie();
    afficherImage(0);

    statut.textContent = libelleStatut(r.statut, langueCourante);
    statut.setAttribute("data-statut", r.statut);
    titre.textContent = t.titre;
    texte.textContent = t.description;
    btnFermer.setAttribute("aria-label", tr().fermer);

    contenu.scrollTop = 0;
    modale.hidden = false;
    document.body.style.overflow = "hidden";   // bloque le défilement de la page derrière
    btnFermer.focus();
    demarrerAuto();
  };

  /* ---------- Fermer ---------- */

  function fermer() {
    if (modale.hidden) return;
    arreterAuto();
    lb.hidden = true;
    lbImage.src = "";
    modale.hidden = true;
    document.body.style.overflow = "";
    imgPrincipale.src = "";   // libère l'image
    if (declencheur && typeof declencheur.focus === "function") declencheur.focus();
  }

  btnFermer.addEventListener("click", fermer);
  fond.addEventListener("click", fermer);

  /* ---------- Clavier ---------- */

  document.addEventListener("keydown", (e) => {
    if (modale.hidden) return;

    const zone = lb.hidden ? contenu : lb;   // la visionneuse passe devant la modale

    if (e.key === "Escape") {
      if (!lb.hidden) fermerLightbox();   // d'abord la visionneuse
      else fermer();
    } else if (e.key === "ArrowLeft" && images.length > 1) {
      afficherImage(index - 1);
    } else if (e.key === "ArrowRight" && images.length > 1) {
      afficherImage(index + 1);
    } else if (e.key === "Tab") {
      // Garde le focus à l'intérieur de la fenêtre active
      const focusables = zone.querySelectorAll("button:not([hidden]), .modale-image");
      if (!focusables.length) return;
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    }
  });
})();