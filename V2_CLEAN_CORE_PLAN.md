# CHEBSEL v2 CLEAN CORE

Version de travail: `2.0.0-alpha.1`
Branche: `v2-clean-core`

## Règles non négociables

1. Un seul routeur: `js/v2/router.js`.
2. Aucun `history.back()` pour la navigation interne.
3. Un seul shell de rôle: `js/v2/role-config.js`.
4. Aucun `MutationObserver` sur `document.body`.
5. Aucun iframe/srcdoc pour Appel ou Finance.
6. Un seul pipeline de démarrage: Auth → données locales → rôle → rendu → services de fond.
7. Splash unique jusqu'au rendu final.
8. Lazy loading pour les modules fonctionnels.
9. Un seul `APP_VERSION`.
10. Chaque module expose un `init()` idempotent si une initialisation est requise.
11. État global centralisé dans `AppState`.
12. Aucun merge vers `main` avant validation de la matrice de tests.

## Ordre de migration

### Phase 0 — Core (en cours)
- AppState
- Router/navigationStack
- Role config
- Storage/migration des clés locales v1
- Auth/session v2
- Splash/startup
- Service worker
- Update manager

### Phase 1 — Membres
- Liste centrale
- Ajouter/modifier/désactiver
- Fiche membre
- Compatibilité données v1

### Phase 2 — Appel / Secrétariat
- Nouvel appel
- Statuts P/RM/RNM/AM/ANM/ANMP
- Historique
- Paramètres
- Santé de ponctualité
- Rapports mensuels / période libre

### Phase 3 — Finance / Trésorerie
- Cotisations et amendes
- Paiement partiel/complet
- Débiteurs
- Dépenses
- Paramètres
- Historique / santé financière
- Rapports mensuels / période libre
- JPEG après validation

### Phase 4 — Gouvernance
- Workflow Secrétaire/Tresorier → Président
- Validation
- Réouverture avec motif obligatoire
- Journal d'audit
- Conflits

### Phase 5 — Archives, sauvegarde et restauration
- Archives
- Export/import
- Validation de sauvegarde
- Passation

### Phase 6 — Cloud
- Supabase Auth
- Sync non bloquante
- File offline
- Résolution de conflits

### Phase 7 — Release
- Tests laptop
- Tests Android
- Test offline/online
- Test update PWA
- Migration de données v1 → v2
- Release 2.0.0

## Code v1 interdit dans le runtime v2

Les fichiers `legacy-core.js`, `embedded-apps.js`, `clean-shell-*`, `role-shell-*`, `strict-role-ui-*`, `president-scope-*`, `secretary-scope-*`, `treasurer-scope-*`, `hotfix-*` et anciens contrôleurs `navigation-*` peuvent rester temporairement dans la branche pour référence historique, mais **ne doivent jamais être référencés par `index.html`, `app.js` ou `sw.js` v2**. Ils seront supprimés après migration fonctionnelle complète.
