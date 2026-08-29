# La Truffe Gourmande

Site e-commerce de pâtisseries **pour chiens**. Étape en cours : la maquette (design + contenu),
en HTML/CSS/JS statique, sans dépendance ni build.

## Le parti pris — à lire avant d'écrire une ligne

Le site ne parle pas *du* chien, il parle **au** chien. Le visiteur est le chien : on le
tutoie, c'est lui qui choisit, c'est lui qu'on félicite. L'humain est un personnage
secondaire — un porte-carte avec des pouces.

La règle tient en trois points :

1. **Toute la copie s'adresse au chien**, y compris les labels de formulaire et les
   messages d'erreur.
2. **L'humain n'apparaît qu'à la fin.** L'étape 3 du tunnel (« Va chercher ton humain »)
   est le pivot : le chien a tout fait, il lui manque juste des pouces et une carte.
3. **L'étape 4 bascule en « mode humain »** — classe `is-human` sur le panneau : police
   système, palette grise et bleue, ton administratif. Le contraste *est* la blague.
   L'étape 5 revient à la voix du chien.

Une nouvelle section qui ne respecte pas ces trois points est hors sujet, même si elle est jolie.

## En ligne

**https://tompoyeau.github.io/truffe-gourmande/**

Hébergé par GitHub Pages, branche `main`, racine du dépôt. **Un `git push` suffit à
redéployer** : Pages reconstruit tout seul en une trentaine de secondes.

GitHub Pages sert `404.html` automatiquement sur les chemins inconnus — rien à configurer.
Seule limite connue : sur une URL erronée de plus d'un niveau (`/truffe-gourmande/a/b/c`),
les liens relatifs vers `assets/` de la page 404 ne résolvent pas et la page s'affiche sans
style. Le cas courant (une faute de frappe sur un seul segment) fonctionne correctement.

## Lancer en local

```bash
python -m http.server 5599 --directory D:/dev/truffe-gourmande
```

Puis http://localhost:5599

## Structure

```
index.html                 accueil + tunnel de commande
produit-waouf-cake.html    fiche produit détaillée (gabarit des cinq autres)
404.html                   page introuvable, voix du chien
pour-ton-humain.html       la seule page sobre : infos sérieuses pour l'humain
assets/css/style.css       design system (variables) + accueil + tunnel
assets/css/pages.css       fiche produit + 404 + page humaine
assets/js/main.js          tout le comportement, commun aux quatre pages
```

`main.js` est chargé tel quel partout : **chaque bloc est gardé** par la présence de ses
éléments (`if (grid)`, `if (nameInput)`, `if (pdp)`…). Une page qui n'a pas de configurateur
n'exécute pas le configurateur. Ajouter un bloc = ajouter sa garde.

La **gamelle est persistée en `localStorage`** (`truffe.gamelle`) : elle survit au passage
de la fiche produit à l'accueil. Elle est vidée à la confirmation de commande.

En développement, le navigateur garde `main.js` en cache agressif derrière
`python -m http.server` : **rechargement forcé** (Ctrl+Maj+R) après chaque modification du JS,
sinon on débogue l'ancienne version.

Le sprite SVG est **dupliqué en tête de chaque page** : il n'y a ni gabarit ni build.
À factoriser le jour où le site passe sous un moteur de templates.

Le 404 n'est servi qu'à l'adresse `/404.html` avec `python -m http.server`. En production,
pointer la page d'erreur du serveur dessus (`error_page 404 /404.html;` sous nginx,
`ErrorDocument 404 /404.html` sous Apache, `notFoundPage` chez la plupart des hébergeurs statiques).

## Direction artistique

| | |
|---|---|
| Crème `#FDF6EE` | fond général |
| Chocolat `#2E2018` | texte, bandeaux sombres |
| Terracotta `#C4622D` | accent, boutons |
| Caramel `#C98551` | pâte, illustrations |
| Sauge `#7A9E7E` | accent secondaire (frais, végétal) |
| Truffe `#F3C7B4` | rose museau, touches douces |

Typo : **Fraunces** (titres, prix) + **Nunito** (courant).
Illustrations : SVG plats faits maison — aucune photo, aucun asset externe.
Le motif de patte et l'os servent de fil rouge (logo, puces, séparateurs, topper de gâteau).

## Ce qui est branché

- Menu mobile, header collant, bandeau concept en tête de page
- Filtres de la vitrine (catégorie)
- **La gamelle** (panier) : lignes, quantités +/−, sous-total, livraison offerte dès 35 €
- **Tunnel de commande en 5 étapes** : gamelle → adresse → « va chercher ton humain » →
  paiement en mode humain → confirmation. Modale avec piège à focus, fermeture Échap,
  bottom-sheet sur mobile.
- Configurateur sur-mesure : prénom écrit sur le gâteau SVG, base (couleur), taille (prix) ;
  chaque configuration part dans la gamelle comme une ligne distincte
- Newsletter : validation d'e-mail côté client, pas d'envoi

Le formulaire de carte de l'étape 4 est **volontairement désactivé** et signalé comme
maquette : aucune donnée de paiement n'est saisie ni transmise.

## À compléter avant toute mise en ligne

Deux `TODO` sont posés dans `pour-ton-humain.html` :

- le **numéro du centre antipoison vétérinaire** et celui de la clinique partenaire,
  à vérifier avant publication — cette information peut compter un jour ;
- les **CGV**, à rédiger avec un juriste : le régime de rétractation des denrées
  alimentaires périssables est particulier et ne s'improvise pas depuis une page de contenu.

Les chiffres du site (adresse, horaires, délais, tarifs de port, allergènes) sont ceux
de la maquette. À remplacer par les vrais.

## Reste à faire

- Vraies photos produit (ou garder le parti pris illustration)
- **Les cinq autres fiches produit** — `produit-waouf-cake.html` sert de gabarit :
  seul son titre est cliquable dans la vitrine, les cinq autres cartes attendent leur page
- Vrai tunnel de paiement (prestataire, champs de carte hébergés chez lui)
- Mentions légales
