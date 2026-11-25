-- schema.sql : base de données du site HD TECHNOLOGIE
-- À lancer UNE seule fois sur un projet Supabase neuf.
-- Créer d'abord le bucket "photos" (public) avant la partie 8.

-- 1) TABLE services
create table services (
  id bigint generated always as identity primary key,
  titre_fr text not null,
  titre_en text not null,
  description_fr text,
  description_en text,
  icone text,
  ordre int not null default 0,
  visible boolean not null default true,
  date_ajout timestamptz not null default now()
);

-- 2) TABLE realisations (terminées ET en cours)
create table realisations (
  id bigint generated always as identity primary key,
  titre_fr text not null,
  description_fr text,
  titre_en text,
  description_en text,
  image_url text not null,
  statut text not null default 'termine' check (statut in ('en_cours', 'termine')),
  ordre int not null default 0,
  visible boolean not null default true,
  date_ajout timestamptz not null default now()
);

-- 3) TABLE reglages (infos du site modifiables par l'admin)
create table reglages (
  cle text primary key,
  valeur_fr text,
  valeur_en text
);

-- 4) TABLE visites (statistiques, sans nom ni adresse IP)
create table visites (
  id bigint generated always as identity primary key,
  page text not null check (char_length(page) < 100),
  visiteur text not null check (char_length(visiteur) < 50),
  date_visite timestamptz not null default now()
);

-- 5) TABLE realisation_images (plusieurs images par réalisation)
create table realisation_images (
  id bigint generated always as identity primary key,
  realisation_id bigint not null references realisations(id) on delete cascade,
  image_url text not null,
  ordre int not null default 0
);

create index on realisation_images (realisation_id, ordre);

-- 6) SECURITE (RLS)
alter table services enable row level security;
alter table realisations enable row level security;
alter table reglages enable row level security;
alter table visites enable row level security;
alter table realisation_images enable row level security;

create policy "lecture publique services" on services
  for select to anon, authenticated using (visible = true);
create policy "lecture publique realisations" on realisations
  for select to anon, authenticated using (visible = true);
create policy "lecture publique reglages" on reglages
  for select to anon, authenticated using (true);
create policy "lecture publique images" on realisation_images
  for select to anon
  using (exists (select 1 from realisations r where r.id = realisation_id and r.visible = true));

create policy "admin gere services" on services
  for all to authenticated using (true) with check (true);
create policy "admin gere realisations" on realisations
  for all to authenticated using (true) with check (true);
create policy "admin gere reglages" on reglages
  for all to authenticated using (true) with check (true);
create policy "admin gere images" on realisation_images
  for all to authenticated using (true) with check (true);

-- visites : tout visiteur peut ENREGISTRER une visite, seul l'admin peut les LIRE
create policy "tout le monde enregistre une visite" on visites
  for insert to anon, authenticated with check (true);
create policy "admin lit les visites" on visites
  for select to authenticated using (true);

-- 7) DROITS D'ACCES (grant) : nécessaires en plus du RLS
grant usage on schema public to anon, authenticated;
grant select on services, realisations, reglages to anon, authenticated;
grant insert, update, delete on services, realisations, reglages to authenticated;
grant insert on visites to anon, authenticated;
grant select on visites to authenticated;
grant select on realisation_images to anon;
grant select, insert, update, delete on realisation_images to authenticated;
grant usage, select on sequence realisation_images_id_seq to authenticated;

-- 8) FONCTIONS DE STATISTIQUES (appelées par la page admin)
create or replace function stats_visites()
returns table (total bigint, uniques bigint, aujourdhui bigint)
language sql security invoker as $$
  select count(*),
         count(distinct visiteur),
         count(*) filter (where date_visite >= date_trunc('day', now()))
  from visites;
$$;

create or replace function stats_pages()
returns table (page text, visites bigint, uniques bigint)
language sql security invoker as $$
  select page, count(*), count(distinct visiteur)
  from visites
  group by page
  order by count(*) desc;
$$;

revoke execute on function stats_visites() from public, anon;
revoke execute on function stats_pages() from public, anon;
grant execute on function stats_visites() to authenticated;
grant execute on function stats_pages() to authenticated;

-- 9) STOCKAGE DES PHOTOS : règles (le bucket "photos" doit exister)
create policy "admin envoie photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');
create policy "admin modifie photos" on storage.objects
  for update to authenticated using (bucket_id = 'photos') with check (bucket_id = 'photos');
create policy "admin supprime photos" on storage.objects
  for delete to authenticated using (bucket_id = 'photos');

-- 10) DONNEES D'EXEMPLE
insert into services (titre_fr, titre_en, description_fr, description_en, icone, ordre) values
('Réseau et télécommunication', 'Networks and telecommunications',
 'Installation des équipements réseau dans les structures.',
 'Installation of network equipment in organizations.', 'reseau', 1),
('Vidéosurveillance', 'Video surveillance',
 'Installation de caméras de surveillance.',
 'Installation of surveillance cameras.', 'camera', 2),
('Sécurité', 'Security',
 'Installation de clôtures électriques.',
 'Installation of electric fences.', 'securite', 3),
('Domotique', 'Home automation',
 'Équipements pour l''internet des objets.',
 'Equipment for the Internet of Things.', 'domotique', 4),
('Énergie renouvelable', 'Renewable energy',
 'Solutions d''énergie renouvelable.',
 'Renewable energy solutions.', 'energie', 5),
('Développement web et logiciel', 'Web and software development',
 'Création de sites web et de logiciels.',
 'Websites and software development.', 'code', 6);

insert into reglages (cle, valeur_fr, valeur_en) values
('whatsapp', '2290166227171', '2290166227171'),
('telephone', '+229 01 66 22 71 71', '+229 01 66 22 71 71'),
('email', 'hdtechnologiebenin@gmail.com', 'hdtechnologiebenin@gmail.com'),
('slogan', 'Connectons le monde autrement', 'Let''s connect the world differently');