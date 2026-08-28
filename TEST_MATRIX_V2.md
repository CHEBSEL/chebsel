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

## Phase 1 — Membres (bloquant avant migration Appel)

### Compatibilité v1
- [ ] Charger une installation contenant `chebsel_master_members_v1` et retrouver le même nombre de membres dans v2.
- [ ] Si le registre maître est absent, récupérer `attendance.members` sans perdre `attendance.calls`.
- [ ] Si le registre maître et `attendance.members` sont absents, récupérer `finance.members` sans perdre `finance.entries`.
- [ ] Après modification d'un membre dans v2, mettre à jour `chebsel_master_members_v1`.
- [ ] Après modification d'un membre dans v2, synchroniser uniquement la liste `members` des objets Appel/Finance v1 sans écraser leurs autres propriétés ni leurs historiques.
- [ ] Préserver les champs v1 inconnus lors d'une modification (`...m`).
- [ ] Les IDs des membres existants restent inchangés afin de conserver les liens avec appels, dettes et paiements.

### Registre central
- [ ] Afficher actifs et inactifs avec statut visuel.
- [ ] Rechercher par nom.
- [ ] Rechercher par prénom.
- [ ] Rechercher par matricule / numéro.
- [ ] Rechercher par téléphone.
- [ ] Filtrer Tous / Actifs / Inactifs.
- [ ] Trier les membres par nom sans modifier les données stockées.

### Ajout / modification / statut
- [ ] Président peut ajouter un membre.
- [ ] Secrétaire peut ajouter un membre.
- [ ] Trésorier peut ajouter un membre.
- [ ] Visiteur ne voit aucun bouton d'écriture.
- [ ] Ajouter exige au moins un prénom ou un nom.
- [ ] Modifier conserve l'ID du membre.
- [ ] Modifier nom, prénom, téléphone, fonction, catégorie, groupe, mois début cotisation, observation.
- [ ] Désactiver ne supprime pas l'historique.
- [ ] Réactiver restaure le statut Actif.
- [ ] Aucun bouton de suppression définitive dans Phase 1.

### Fiche individuelle
- [ ] Ouvrir `Membres → Fiche` ajoute `member-profile` au navigationStack.
- [ ] Retour depuis la fiche revient exactement à Membres.
- [ ] Réouvrir la même fiche fonctionne sans listener doublé.
- [ ] Afficher identité, statut, téléphone, fonction, catégorie, groupe et début cotisation.
- [ ] Afficher nombre d'activités, présences, retards et absences à partir de l'historique v1.
- [ ] Afficher taux de présence et taux de ponctualité.
- [ ] Afficher dû, payé et dette à partir des entrées Finance v1.
- [ ] Modifier depuis la fiche puis rester sur la fiche mise à jour.

### Stabilité mobile Membres
- [ ] Recherche rapide ne provoque aucun freeze.
- [ ] Ouvrir/fermer éditeur 10 fois ne crée pas de doublon de formulaire/listener.
- [ ] Désactiver/réactiver plusieurs membres ne fait pas clignoter tout le shell.
- [ ] Aucun iframe.
- [ ] Aucun MutationObserver.
- [ ] Aucun setInterval.

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
