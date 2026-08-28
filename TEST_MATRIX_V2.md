# CHEBSEL v2 — Matrice de tests

Aucun release stable ne peut être publié avec un test critique en échec.

## Règle commune à chaque écran

Pour chaque rôle et chaque route:
1. Ouvrir depuis le parent attendu.
2. Vérifier le contenu et les droits.
3. Enregistrer/modifier si l'écran est éditable.
4. Appuyer sur Retour.
5. Vérifier qu'un seul niveau est retiré de `navigationStack`.
6. Vérifier qu'on ne quitte jamais CHEBSEL.
7. Réouvrir la route.
8. Vérifier qu'il n'y a ni doublon de listener, ni écran blanc, ni freeze.

## Président
- [ ] Accueil → Membres → Retour → Accueil
- [ ] Accueil → Secrétariat → Appel → Retour → Secrétariat
- [ ] Secrétariat → Paramètres → Retour → Secrétariat
- [ ] Secrétariat → Historique → Retour → Secrétariat
- [ ] Accueil → Trésorerie → Paiements → Saisir → Retour → Paiements
- [ ] Paiements → Paramètres → Retour → Paiements
- [ ] Trésorerie → Débiteurs → Retour → Trésorerie
- [ ] Trésorerie → Dépenses → Retour → Trésorerie
- [ ] Trésorerie → Historique → Retour → Trésorerie
- [ ] Accueil → Rapports → Retour → Accueil
- [ ] Accueil → Archives → Retour → Accueil
- [ ] Accueil → Journal des conflits → Retour → Accueil
- [ ] Accueil → Paramètres → Retour → Accueil
- [ ] Accueil → Confidentialité → Retour → Accueil
- [ ] Accueil → À propos → Retour → Accueil
- [ ] Retour sur Accueil = no-op

## Secrétaire
- [ ] Accueil → Membres → Retour
- [ ] Accueil → Appel → enregistrer → Retour → réouvrir
- [ ] Accueil → Historique → Retour
- [ ] Accueil → Rapports ponctualité → Retour
- [ ] Accueil → Débiteurs → Retour
- [ ] Accueil → Archives → Retour
- [ ] Retour sur Accueil = no-op

## Trésorier
- [ ] Accueil → Membres → Retour
- [ ] Accueil → Paiements → Saisir → enregistrer → Retour → réouvrir
- [ ] Paiements → Paramètres → Retour
- [ ] Accueil → Débiteurs → Retour
- [ ] Accueil → Dépenses → enregistrer → Retour → réouvrir
- [ ] Accueil → Historique → Retour
- [ ] Accueil → Rapports financiers → Retour
- [ ] Accueil → Archives → Retour
- [ ] Retour sur Accueil = no-op

## Visiteur
- [ ] Accueil → Membres → Retour
- [ ] Accueil → Débiteurs → Retour
- [ ] Aucun bouton d'écriture
- [ ] Retour sur Accueil = no-op

## Démarrage / performance
- [ ] Splash unique; aucun flash de l'ancien UI
- [ ] Shell final rendu une seule fois
- [ ] Aucun MutationObserver global
- [ ] Aucun iframe Appel/Finance
- [ ] Aucun module chargé deux fois
- [ ] Aucun setInterval de rafraîchissement UI
- [ ] Premier rendu utilisable hors ligne après première installation

## PWA / Update
- [ ] Une seule notification de mise à jour
- [ ] Bouton Mizajou répond au premier clic
- [ ] `skipWaiting` → `controllerchange` → un seul reload
- [ ] Aucune notification update après installation de la même version
- [ ] Service worker ne cache pas les appels Supabase/API

## Plateformes
Chaque test critique ci-dessus doit être exécuté sur:
- [ ] Windows / navigateur installé PWA
- [ ] Android / PWA installée
- [ ] Mode online
- [ ] Mode offline
- [ ] Reconnexion après offline
