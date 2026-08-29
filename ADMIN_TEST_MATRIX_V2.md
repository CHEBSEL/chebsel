# CHEBSEL v2 — Matrice de tests Administration

Aucun merge vers `main` tant qu'un test critique ci-dessous échoue sur Windows ou Android.

## Président — Rapports
- [ ] Accueil → Rapports → Retour → Accueil.
- [ ] Changer le mois met à jour Dû, Payé, Créances, Dépenses, Solde caisse et Présence.
- [ ] Un mois sans données affiche des totaux à zéro sans erreur.
- [ ] Ouvrir/Fermer Rapports 10 fois sans freeze ni listener doublé.

## Archives / Sauvegarde
- [ ] Président peut exporter une sauvegarde JSON.
- [ ] Secrétaire peut ouvrir Archives selon son menu.
- [ ] Trésorier peut ouvrir Archives selon son menu.
- [ ] Le fichier exporté contient `schema=CHEBSEL_V2_BACKUP`.
- [ ] Restaurer un fichier valide remet Membres, Appel, Finance, Paramètres et Conflits.
- [ ] Un fichier invalide est refusé sans modifier les données.
- [ ] Preview: restore n'écrit jamais dans les clés live v1.
- [ ] Retour après restauration revient à Accueil sans freeze.

## Journal des conflits
- [ ] Seulement Président peut écrire.
- [ ] Ajouter un dossier Ouvert.
- [ ] Modifier sujet, personnes, observation.
- [ ] Passer Ouvert → Suivi → Résolu.
- [ ] Un conflit ouvert génère une notification uniquement pour Président.
- [ ] Résoudre le conflit retire l'alerte active après recalcul.
- [ ] Retour → Accueil et réouverture conservent les données.

## Paramètres
- [ ] Seulement Président peut modifier Paramètres généraux.
- [ ] Enregistrer nom organisation.
- [ ] Passer thème Sombre → Clair sans reload.
- [ ] Recharger l'application conserve le thème.
- [ ] Aucune modification de thème ne crée de MutationObserver ni timer.

## Confidentialité
- [ ] Affiche le nombre de Membres, Appels, Entrées Finance et Conflits.
- [ ] Aucun secret/mot de passe n'est affiché.
- [ ] Retour fonctionne en un seul niveau.

## À propos
- [ ] Affiche la version v2 courante.
- [ ] Affiche l'état réseau En ligne/Hors ligne.
- [ ] Retour fonctionne sans quitter la PWA.

## Notifications
- [ ] 0 unread = aucune pastille rouge.
- [ ] >0 unread = pastille avec le nombre réel.
- [ ] Cliquer la cloche ouvre `notifications` dans le router interne.
- [ ] Retour depuis Notifications revient au parent en un seul niveau.
- [ ] Tout marquer comme lu retire immédiatement la pastille.
- [ ] Une modification Finance déclenche un recalcul par `chebsel:data-changed`, sans polling.
- [ ] Une modification Appel déclenche un recalcul par événement, sans polling.
- [ ] Une modification Journal déclenche un recalcul par événement, sans polling.
- [ ] Secrétaire ne voit jamais une notification de Journal des conflits.
- [ ] Trésorier ne voit jamais une notification de Journal des conflits.
- [ ] Visiteur ne voit jamais une notification de Journal des conflits.
- [ ] Aucun `setInterval` pour Notifications.

## Navigation / stabilité
- [ ] Accueil → Rapports → Back.
- [ ] Accueil → Archives → Back.
- [ ] Accueil → Journal → Back.
- [ ] Accueil → Paramètres → Back.
- [ ] Accueil → Confidentialité → Back.
- [ ] Accueil → À propos → Back.
- [ ] Accueil → Notifications → Back.
- [ ] Répéter chaque trajet 10 fois sur Android.
- [ ] Aucun écran blanc.
- [ ] Aucun retour vers launcher Android.
- [ ] Aucun freeze.
- [ ] Back sur Accueil = no-op.
