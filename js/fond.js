// js/fond.js : animation de fond de la section Accueil
// Inspirée du logo HD TECHNOLOGIE : un croissant de globe fait de petits carrés
// arrondis, rangés en lignes (comme des latitudes). Les carrés s'écrasent vers le
// bord du globe, comme sur le logo. Le globe tourne lentement.
// + quelques petits carrés qui flottent doucement vers le haut.
// Léger : un seul <canvas>, s'arrête quand on ne le voit pas.

(function () {
  const hero = document.getElementById("accueil");
  if (!hero) return;

  // --- Création du canvas (pas besoin de toucher au HTML) ---
  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.insertBefore(canvas, hero.firstChild);
  const ctx = canvas.getContext("2d");

  // --- Réglages (à modifier pour tester) ---
  const LIGNES_PC = 25;          // nombre de lignes de carrés sur le globe (ordinateur)
  const LIGNES_MOBILE = 20;      // moins sur téléphone (plus léger)
  const REMPLISSAGE = 0.68;      // taille du carré dans sa case (1 = collés, 0.5 = très espacés)
  const VITESSE_GLOBE = 0.006;   // rotation (plus grand = plus rapide)
  const INCLINAISON = 0.25;      // le globe penche vers l'avant
  const PENCHE = -0.45;          // l'axe du globe est penché sur le côté (comme le logo)
  const OUVERTURE = 0.45;        // le croissant s'ouvre plus en haut qu'en bas
  const NB_FLOTTANTS = 45;       // petits carrés qui flottent

  const reduireMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let largeur = 0, hauteur = 0, mobile = false;
  let angle = 0;
  let cases = [];
  let flottants = [];
  let enCours = false;
  let visible = true;

  const cosI = Math.cos(INCLINAISON), sinI = Math.sin(INCLINAISON);
  const cosZ = Math.cos(PENCHE), sinZ = Math.sin(PENCHE);

  // --- Grille du globe : chaque ligne a moins de carrés près des pôles,
  //     donc les carrés gardent à peu près la même taille partout ---
  function creerGrille(nbLignes) {
    const liste = [];
    const dLat = Math.PI / nbLignes;
    for (let i = 0; i < nbLignes; i++) {
      const lat = -Math.PI / 2 + (i + 0.5) * dLat;
      const nbColonnes = Math.max(6, Math.round(2 * nbLignes * Math.cos(lat)));
      const dLon = (2 * Math.PI) / nbColonnes;
      for (let j = 0; j < nbColonnes; j++) {
        liste.push({ lat: lat, lon: (j + 0.5) * dLon, dLat: dLat, dLon: dLon });
      }
    }
    return liste;
  }

  // --- Projection d'un point (latitude, longitude) de la sphère vers l'écran ---
  // Résultat dans l'objet "pt" : x et y entre -1 et 1, z = face au spectateur (1 = devant)
  const pt = { x: 0, y: 0, z: 0 };
  function projeter(lat, lon) {
    const cl = Math.cos(lat);
    const x = cl * Math.sin(lon);
    const y = Math.sin(lat);
    const z = cl * Math.cos(lon);
    // inclinaison avant / arrière
    const y1 = y * cosI - z * sinI;
    const z1 = y * sinI + z * cosI;
    // axe penché sur le côté
    pt.x = x * cosZ - y1 * sinZ;
    pt.y = x * sinZ + y1 * cosZ;
    pt.z = z1;
  }

  // --- Carrés flottants ---
  function creerFlottants(n) {
    const liste = [];
    for (let i = 0; i < n; i++) {
      liste.push({
        x: Math.random(),
        y: Math.random(),
        taille: 4 + Math.random() * 9,
        vitesse: 0.0003 + Math.random() * 0.0008,
        alpha: 0.05 + Math.random() * 0.13,
      });
    }
    return liste;
  }

  // --- Adapter le canvas à la taille de la section ---
  function redimensionner() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // net sans être lourd
    largeur = hero.clientWidth;
    hauteur = hero.clientHeight;
    canvas.width = largeur * dpr;
    canvas.height = hauteur * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    mobile = largeur <= 768;
    cases = creerGrille(mobile ? LIGNES_MOBILE : LIGNES_PC);
    if (flottants.length === 0) flottants = creerFlottants(NB_FLOTTANTS);
    dessiner();
  }

  // --- Dessin d'une image ---
  function dessiner() {
    ctx.clearRect(0, 0, largeur, hauteur);

    // 1) petits carrés flottants
    for (const f of flottants) {
      ctx.fillStyle = "rgba(255, 255, 255, " + f.alpha + ")";
      ctx.fillRect(f.x * largeur, f.y * hauteur, f.taille, f.taille);
    }

    // 2) croissant de globe
    const rayon = Math.min(largeur, hauteur) * (mobile ? 0.5 : 0.42);
    const cx = mobile ? largeur * 0.62 : largeur * 0.8;
    const cy = hauteur * 0.55;
    const opacite = mobile ? 0.4 : 1;   // plus discret sur téléphone (le texte passe dessus)
    const demi = REMPLISSAGE / 2;

    ctx.lineJoin = "round";   // coins arrondis comme sur le logo
    ctx.lineWidth = 1.5;

    for (const c of cases) {
      // centre de la case : est-elle visible ?
      projeter(c.lat, c.lon + angle);
      if (pt.z < 0.04) continue;               // derrière le globe : on saute

      // Le croissant : seule la partie gauche du globe est dessinée (plus large en haut)
      const limite = OUVERTURE * pt.y;
      let fondu = (limite - pt.x) / 0.35;      // 1 = bien dedans, 0 = bord intérieur du croissant
      if (fondu <= 0) continue;
      if (fondu > 1) fondu = 1;

      const alpha = (0.2 + pt.z * 0.7) * fondu * opacite;
      if (alpha < 0.02) continue;
      const couleur = "rgba(255, 255, 255, " + alpha.toFixed(3) + ")";
      ctx.fillStyle = couleur;
      ctx.strokeStyle = couleur;

      // les 4 coins de la case, projetés : le carré s'écrase tout seul près du bord
      ctx.beginPath();
      projeter(c.lat - c.dLat * demi, c.lon - c.dLon * demi + angle);
      ctx.moveTo(cx + pt.x * rayon, cy - pt.y * rayon);
      projeter(c.lat - c.dLat * demi, c.lon + c.dLon * demi + angle);
      ctx.lineTo(cx + pt.x * rayon, cy - pt.y * rayon);
      projeter(c.lat + c.dLat * demi, c.lon + c.dLon * demi + angle);
      ctx.lineTo(cx + pt.x * rayon, cy - pt.y * rayon);
      projeter(c.lat + c.dLat * demi, c.lon - c.dLon * demi + angle);
      ctx.lineTo(cx + pt.x * rayon, cy - pt.y * rayon);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // --- Mouvement ---
  function mettreAJour() {
    angle += VITESSE_GLOBE;
    for (const f of flottants) {
      f.y -= f.vitesse;
      if (f.y < -0.05) {          // sorti par le haut : revient par le bas
        f.y = 1.05;
        f.x = Math.random();
      }
    }
  }

  function boucle() {
    if (!enCours) return;
    mettreAJour();
    dessiner();
    requestAnimationFrame(boucle);
  }

  function demarrer() {
    if (enCours || reduireMouvement || !visible || document.hidden) return;
    enCours = true;
    requestAnimationFrame(boucle);
  }

  function arreter() {
    enCours = false;
  }

  // --- Économie de batterie et de connexion : on arrête quand on ne voit pas la section ---
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) arreter(); else demarrer();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entrees) => {
      visible = entrees[0].isIntersecting;
      if (visible) demarrer(); else arreter();
    }).observe(hero);
  }

  window.addEventListener("resize", redimensionner);

  redimensionner();
  demarrer();   // si "réduire les animations" est activé : une seule image fixe
})();
