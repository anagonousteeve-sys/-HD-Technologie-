// js/admin.js : espace administrateur
const $ = (id) => document.getElementById(id);

// ---------- État connecté / non connecté ----------
async function afficherEtat() {
  const { data } = await db.auth.getSession();
  const connecte = !!data.session;
  $("connexion").hidden = connecte;
  $("tableau").hidden = !connecte;
  $("btn-deconnexion").hidden = !connecte;
  if (connecte) {
    chargerStats();
    chargerListe();
    remplirReglages();
  }
}

// ---------- Connexion / déconnexion ----------
$("form-connexion").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("msg-connexion").textContent = "";
  const { error } = await db.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("mdp").value
  });
  if (error) {
    $("msg-connexion").textContent = "Email ou mot de passe incorrect.";
    return;
  }
  $("mdp").value = "";
  afficherEtat();
});

$("btn-deconnexion").addEventListener("click", async () => {
  await db.auth.signOut();
  afficherEtat();
});

// ---------- Statistiques ----------
async function chargerStats() {
  const t = await db.rpc("stats_visites");
  if (!t.error && t.data && t.data[0]) {
    $("stat-total").textContent = t.data[0].total;
    $("stat-uniques").textContent = t.data[0].uniques;
    $("stat-aujourdhui").textContent = t.data[0].aujourdhui;
  }
  const p = await db.rpc("stats_pages");
  const liste = $("stat-pages");
  liste.innerHTML = "";
  (p.data || []).forEach((l) => {
    const li = document.createElement("li");
    li.textContent = l.page + " : " + l.visites + " visites (" + l.uniques + " visiteurs)";
    liste.appendChild(li);
  });
}

// ---------- Réduire la photo avant l'envoi (connexions lentes) ----------
function reduireImage(fichier, max = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * ratio);
      c.height = Math.round(img.height * ratio);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion impossible"))), "image/jpeg", 0.8);
    };
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = URL.createObjectURL(fichier);
  });
}

// ---------- Publier une réalisation ----------
$("form-publier").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("msg-publier");
  msg.textContent = "Envoi en cours...";
  try {
    const fichier = $("photo").files[0];
    if (!fichier) throw new Error("Choisis une photo.");
    if (!fichier.type.startsWith("image/")) throw new Error("Le fichier doit être une image.");

    const blob = await reduireImage(fichier);
    const chemin = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
    const envoi = await db.storage.from("photos").upload(chemin, blob, { contentType: "image/jpeg" });
    if (envoi.error) throw envoi.error;
    const url = db.storage.from("photos").getPublicUrl(chemin).data.publicUrl;

    // Règle "tout ou rien" pour l'anglais
    const titreEn = $("titre-en").value.trim();
    const descEn = $("desc-en").value.trim();
    const anglaisComplet = titreEn && descEn;
    const anglaisPartiel = (titreEn || descEn) && !anglaisComplet;

    const ajout = await db.from("realisations").insert({
      titre_fr: $("titre-fr").value.trim(),
      description_fr: $("desc-fr").value.trim() || null,
      titre_en: anglaisComplet ? titreEn : null,
      description_en: anglaisComplet ? descEn : null,
      image_url: url,
      statut: $("statut").value,
      ordre: 0,
      visible: true
    });
    if (ajout.error) throw ajout.error;

    e.target.reset();
    msg.textContent = anglaisPartiel
      ? "Publié. Anglais ignoré : remplis le titre ET la description pour l'activer."
      : "Publié.";
    chargerListe();
  } catch (err) {
    msg.textContent = "Erreur : " + err.message;
  }
});

// ---------- Liste : changer le statut, masquer, supprimer ----------
function creerBouton(texte, action) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn btn-outline";
  b.textContent = texte;
  b.addEventListener("click", action);
  return b;
}

async function majRealisation(id, champs) {
  const { error } = await db.from("realisations").update(champs).eq("id", id);
  if (error) alert("Erreur : " + error.message);
  chargerListe();
}

async function supprimerRealisation(r) {
  if (!confirm("Supprimer définitivement « " + r.titre_fr + " » ?")) return;
  const { error } = await db.from("realisations").delete().eq("id", r.id);
  if (error) { alert("Erreur : " + error.message); return; }
  // On supprime aussi le fichier image (on ignore l'erreur éventuelle)
  const morceau = (r.image_url || "").split("/photos/")[1];
  if (morceau) await db.storage.from("photos").remove([morceau]);
  chargerListe();
}

async function chargerListe() {
  const zone = $("liste-realisations");
  zone.innerHTML = "";
  const { data, error } = await db
    .from("realisations")
    .select("*")
    .order("date_ajout", { ascending: false });
  if (error) { zone.textContent = "Erreur : " + error.message; return; }
  if (!data.length) { zone.textContent = "Aucune réalisation pour l'instant."; return; }

  data.forEach((r) => {
    const ligne = document.createElement("div");
    ligne.className = "admin-ligne";

    const titre = document.createElement("span");
    titre.textContent = r.titre_fr + " (" +
      (r.statut === "en_cours" ? "en cours" : "terminé") +
      (r.visible ? "" : ", masqué") + ")";

    ligne.append(
      titre,
      creerBouton(r.statut === "en_cours" ? "Marquer terminé" : "Marquer en cours",
        () => majRealisation(r.id, { statut: r.statut === "en_cours" ? "termine" : "en_cours" })),
      creerBouton(r.visible ? "Masquer" : "Afficher",
        () => majRealisation(r.id, { visible: !r.visible })),
      creerBouton("Supprimer", () => supprimerRealisation(r))
    );
    zone.appendChild(ligne);
  });
}

// ---------- Infos du site (table reglages) ----------
async function remplirReglages() {
  const reglages = await chargerReglages();
  const val = (cle, lang) => (reglages[cle] && reglages[cle]["valeur_" + lang]) || "";
  $("reg-whatsapp").value = val("whatsapp", "fr");
  $("reg-telephone").value = val("telephone", "fr");
  $("reg-email").value = val("email", "fr");
  $("reg-slogan-fr").value = val("slogan", "fr");
  $("reg-slogan-en").value = val("slogan", "en");
}

$("form-reglages").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("msg-reglages");
  const wa = $("reg-whatsapp").value.trim();
  if (wa && !/^[0-9]{8,15}$/.test(wa)) {
    msg.textContent = "WhatsApp : chiffres seulement, avec l'indicatif (ex : 2290166227171).";
    return;
  }
  const tel = $("reg-telephone").value.trim();
  const mail = $("reg-email").value.trim();
  const { error } = await db.from("reglages").upsert([
    { cle: "whatsapp", valeur_fr: wa, valeur_en: wa },
    { cle: "telephone", valeur_fr: tel, valeur_en: tel },
    { cle: "email", valeur_fr: mail, valeur_en: mail },
    { cle: "slogan", valeur_fr: $("reg-slogan-fr").value.trim(), valeur_en: $("reg-slogan-en").value.trim() }
  ]);
  msg.textContent = error ? "Erreur : " + error.message : "Enregistré.";
});

// ---------- Changer le mot de passe (Supabase Auth, pas une table) ----------
$("form-mdp").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("msg-mdp");
  const a = $("mdp-nouveau").value;
  const b = $("mdp-confirm").value;
  if (a.length < 12) { msg.textContent = "12 caractères minimum."; return; }
  if (a !== b) { msg.textContent = "Les deux mots de passe sont différents."; return; }
  const { error } = await db.auth.updateUser({ password: a });
  if (error) { msg.textContent = "Erreur : " + error.message; return; }
  e.target.reset();
  msg.textContent = "Mot de passe changé.";
});

// ---------- Démarrage ----------
document.addEventListener("DOMContentLoaded", afficherEtat);