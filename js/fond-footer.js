// js/fond-footer.js : petits carrés qui montent dans le pied de page
(function () {
  const footer = document.querySelector(".footer");
  if (!footer) return;

  const canvas = document.createElement("canvas");
  canvas.className = "footer-canvas";
  canvas.setAttribute("aria-hidden", "true");
  footer.insertBefore(canvas, footer.firstChild);
  const ctx = canvas.getContext("2d");

  const NB_PC = 30;
  const NB_MOBILE = 16;
  const reduireMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let largeur = 0, hauteur = 0;
  let carres = [];
  let enCours = false;
  let visible = true;

  function creerCarres(n) {
    const liste = [];
    for (let i = 0; i < n; i++) {
      liste.push({
        x: Math.random(),
        y: Math.random(),
        taille: 4 + Math.random() * 9,
        vitesse: 0.0008 + Math.random() * 0.0016,   // le pied de page est bas : un peu plus vite que l'accueil
        alpha: 0.06 + Math.random() * 0.14
      });
    }
    return liste;
  }

  function redimensionner() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    largeur = footer.clientWidth;
    hauteur = footer.clientHeight;
    canvas.width = largeur * dpr;
    canvas.height = hauteur * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    carres = creerCarres(largeur <= 768 ? NB_MOBILE : NB_PC);
    dessiner();
  }

  function dessiner() {
    ctx.clearRect(0, 0, largeur, hauteur);
    for (const c of carres) {
      ctx.fillStyle = "rgba(255, 255, 255, " + c.alpha + ")";
      ctx.fillRect(c.x * largeur, c.y * hauteur, c.taille, c.taille);
    }
  }

  function mettreAJour() {
    for (const c of carres) {
      c.y -= c.vitesse;
      if (c.y < -0.1) {       // sorti par le haut : revient par le bas
        c.y = 1.1;
        c.x = Math.random();
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

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) arreter(); else demarrer();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entrees) => {
      visible = entrees[0].isIntersecting;
      if (visible) demarrer(); else arreter();
    }).observe(footer);
  }

  window.addEventListener("resize", redimensionner);

  redimensionner();
  demarrer();
})();