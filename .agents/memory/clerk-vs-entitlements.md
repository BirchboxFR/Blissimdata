---
name: Responsabilités Clerk et Blissim
description: Séparation durable entre la gestion d’identité Clerk et les autorisations métier de Blissim Analytics.
---

Clerk doit rester la source de vérité pour l’identité, les invitations, la connexion et le cycle de vie utilisateur. L’application Blissim Analytics attribue directement plusieurs marques à chaque utilisateur, sans notion de compte client intermédiaire ; elle conserve aussi les droits métier comme les pays, expirations, packs et pages autorisées.

**Why:** L’utilisateur a explicitement rejeté la notion de compte client intermédiaire : un utilisateur peut avoir plusieurs marques, prises dans le catalogue BigQuery après connexion du connecteur et issues des exemples en attendant. La gestion générique des identités ne doit pas être reconstruite dans l’application.

**How to apply:** Les futurs écrans utilisateur doivent afficher l’identité en lecture seule et proposer l’attribution directe d’une ou plusieurs marques. Ne réintroduisez pas de rattachement à un compte client. Toute synchronisation d’identité doit venir de Clerk côté serveur.