// js/visites.js : enregistre une visite (aucun nom, aucune adresse IP)
(function () {
  try {
    let id = localStorage.getItem("hdt_visiteur");
    if (!id) {
      id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : "v" + Date.now() + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("hdt_visiteur", id);
    }
    const page = location.pathname.split("/").pop() || "index.html";
    db.from("visites").insert({ page: page, visiteur: id }).then(function () {});
  } catch (e) {
    // une erreur de statistique ne doit jamais casser le site
  }
})();