# CHEBSEL v1.5.0 — Cloud Foundation

1. Créer un projet Supabase dédié CHEBSEL.
2. Exécuter `supabase_schema.sql` dans SQL Editor.
3. Créer les comptes Auth du Président, du Secrétaire et du Trésorier.
4. Récupérer l’UUID de l’organisation avec `select id,name,acronym from public.organizations;`.
5. Ajouter les lignes `user_profiles` pour chaque Auth UUID et le rôle correspondant.
6. Dans CHEBSEL > Cloud Foundation > Configurer, saisir Project URL, clé publique/publishable et email.
7. Ne jamais saisir la clé service_role.
8. Tester uniquement Membres + Calendrier sur deux appareils. Appels et finances restent locaux dans v1.5.0.
