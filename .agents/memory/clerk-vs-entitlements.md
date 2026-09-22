---
name: Responsabilités Clerk et Blissim
description: Séparation durable entre la gestion d’identité Clerk et les autorisations métier de Blissim Analytics.
---

Clerk doit rester la source de vérité pour l’identité, les invitations, la connexion et le cycle de vie du compte. L’application Blissim Analytics gère les comptes clients, marques, pays, expirations, packs et pages autorisées.

**Why:** La gestion générique des utilisateurs ne doit pas être reconstruite dans l’application, tandis que les droits marque/pays/pack sont spécifiques au produit et ne sont pas couverts par le tenant Clerk géré par Replit.

**How to apply:** Les futurs écrans utilisateur doivent afficher l’identité Clerk en lecture seule et ne proposer en modification que les rattachements et autorisations Blissim. Toute synchronisation d’identité doit venir de Clerk côté serveur.