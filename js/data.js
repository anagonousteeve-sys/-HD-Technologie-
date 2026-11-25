// js/data.js : lecture des données depuis Supabase

// B7 : la session admin s'arrête à la fermeture de l'onglet (voir config.js)
const optionsClient = SESSION_ADMIN_PERSISTANTE
  ? {}
  : { auth: { storage: window.sessionStorage } };

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, optionsClient);

let langue = "fr";   // le bouton FR / EN la changera

// B6 : données gardées en mémoire (pas de rechargement au changement de langue)
let cacheServices = null;
let cacheRealisations = null;

async function chargerServices() {
  if (cacheServices) return cacheServices;
  const { data, error } = await db
    .from("services")
    .select("*")
    .eq("visible", true)
    .order("ordre", { ascending: true });
  if (error) { console.error("Erreur services :", error.message); return []; }
  cacheServices = data;
  return data;
}

async function chargerRealisations() {
  if (cacheRealisations) return cacheRealisations;
  const { data, error } = await db
    .from("realisations")
    .select("*, realisation_images(image_url, ordre)")
    .eq("visible", true)
    .order("ordre", { ascending: true })
    .order("date_ajout", { ascending: false });
  if (error) { console.error("Erreur réalisations :", error.message); return []; }

  const liste = data.map((r) => {
    const images = (r.realisation_images || [])
      .slice()
      .sort((a, b) => a.ordre - b.ordre)
      .map((i) => i.image_url);
    delete r.realisation_images;
    r.images = images.length ? images : [r.image_url];   // anciennes réalisations : image_url
    return r;
  });
  cacheRealisations = liste;
  return liste;
}

// Les réglages ne sont pas mis en cache : l'admin les modifie
async function chargerReglages() {
  const { data, error } = await db.from("reglages").select("*");
  if (error) { console.error("Erreur réglages :", error.message); return {}; }
  const reglages = {};
  data.forEach((r) => { reglages[r.cle] = r; });
  return reglages;   // exemple : reglages.whatsapp.valeur_fr
}