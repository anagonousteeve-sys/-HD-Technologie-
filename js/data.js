// js/data.js : lecture des données depuis Supabase
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let langue = "fr";   // le bouton FR / EN la changera à l'étape bilingue

async function chargerServices() {
  const { data, error } = await db
    .from("services")
    .select("*")
    .eq("visible", true)
    .order("ordre", { ascending: true });
  if (error) { console.error("Erreur services :", error.message); return []; }
  return data;
}

async function chargerRealisations() {
  const { data, error } = await db
    .from("realisations")
    .select("*")
    .eq("visible", true)
    .order("ordre", { ascending: true })
    .order("date_ajout", { ascending: false });   // les plus récentes d'abord
  if (error) { console.error("Erreur réalisations :", error.message); return []; }
  return data;
}

async function chargerReglages() {
  const { data, error } = await db.from("reglages").select("*");
  if (error) { console.error("Erreur réglages :", error.message); return {}; }
  const reglages = {};
  data.forEach((r) => { reglages[r.cle] = r; });
  return reglages;   // exemple : reglages.whatsapp.valeur_fr
}