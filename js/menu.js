// js/menu.js : ouvre et ferme le menu sur téléphone
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

// Sécurité : si le HTML n'a pas ces éléments, on ne fait rien (pas d'erreur)
if (burger && menu) {
  // Fonction pour fermer le menu (utilisée à plusieurs endroits)
  function fermerMenu() {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }

  // Clic sur le burger : ouvre si fermé, ferme si ouvert
  burger.addEventListener("click", () => {
    const ouvert = menu.classList.toggle("open"); // true si "open" vient d'être ajouté
    burger.setAttribute("aria-expanded", ouvert);
  });

  // Ferme le menu quand on clique sur un lien
  menu.querySelectorAll("a").forEach((lien) => {
    lien.addEventListener("click", fermerMenu);
  });

  // Ferme le menu avec la touche Échap
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerMenu();
  });

  // Ferme le menu si on clique en dehors
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !burger.contains(e.target)) fermerMenu();
  });
}
