# Pcodes et Liaisons — cahier descriptif

**Module** : référence terrain des codes (boîte à outils Groupe MECATECH Arpent-Nord)
**Version** : 2.2.0 (2026-11-09)
**En ligne** : https://arpent-nord.github.io/APP-PCodes/
**Utilisateurs** : arpenteurs au terrain, sur téléphone (Android, iPhone), aussi sur ordinateur.

## 1. Objectif

Aide-mémoire de poche pour le terrain : trouver un Pcode en quelques touches, se rappeler les liaisons et commandes de calcul du carnet, composer le nom du fichier de levé (`AAMMJJSECT#NATSS`, NDA-001) et retrouver les secteurs des contrats en cours.

## 2. Fonctions

| Fonction | Ce qu'elle fait |
|---|---|
| Recherche de codes | 440 Pcodes, libellés de la liste officielle V2. On tape un chiffre (`4`, `41`, `415`), une abréviation APH (`REM`, `GAR`) ou des mots (`fond fossé`, `fossé fond`). Recherche sans accents ni majuscules, aussi dans les mots-clés (anciennes formulations) ; l'APH exact passe en premier. |
| Aide dans la recherche | Les codes de contrôle (`.1`, `.2`…) et les commandes de calcul (`2P`, `3PP`, `RECT`…) sortent aussi dans les résultats. |
| Liaisons et calculs | Section repliable : codes de contrôle du carnet Leica CS20 et commandes de calcul, avec exemples. |
| Nom du fichier de levé et NAT | Format `AAMMJJSECT#NATSS` avec la date du jour, types de levé (1 à 6) et table des 49 natures. |
| Mes contrats et secteurs | Secteurs reçus par le lien terrain (courriel ou code QR de la fiche du contrat), gardés sur l'appareil. |
| Bandeau du jour | Date, jour julien, exemple de nom de levé et de numéro de point (`AJJJSSNNN`), choix du secteur. |
| Hors ligne | Après une première ouverture avec réseau, l'outil fonctionne sans réseau (`sw.js`). Le pied de page indique « prêt hors ligne ». |

Accès direct par adresse : `#liaisons`, `#nat`, `#contrats` ouvrent la section correspondante.

## 3. Liste maîtresse (source unique)

Les codes et la table NAT sont tenus **à un seul endroit**, dans ce dépôt public :

| Fichier | Contenu |
|---|---|
| `donnees/codes.json` | 440 Pcodes : `code`, `aph`, `description` et `categorie` (liste officielle *Liste_de_codes ArpentNord_Categorie_V2*, sept. 2020, + 905, 906, 909, 911, 913 et code 28 élargi), `couche` DXF et `type` (`d` point, `g` ligne, `c` autre) utilisés par Validation de levé, `motscles` (anciennes formulations de Pcodes, cherchables mais non affichées). |
| `donnees/nat.json` | Types de levé (1 à 7) et 49 natures NAT. Copie publique de la table de l'Administration (`reference.json`) : à garder identique. |

Les outils reçoivent des **copies régénérées** (chaque outil reste un seul fichier qui marche hors ligne) :

| Outil | Commande (à la racine du dépôt APP-PCodes, avec Node.js) |
|---|---|
| Pcodes et Liaisons | `node tools/generer.js` → réécrit `const CODES` et les tableaux NAT / types de `index.html`. |
| Validation de levé | `node tools/maj-validation-leve.js ../validation-leve/index.html` → réécrit `DICT.codes` (garde l'ordre et les couches). |
| Collecte GNSS | `node tools/maj-codes.js ../APP-PCodes/index.html` (script du dépôt Collecte GNSS) → `codes-data.js`. |

**Changer un code** : modifier `donnees/codes.json` (ou `nat.json`), lancer les commandes ci-dessus, puis publier chaque outil touché. Ne jamais modifier les listes à la main dans les `index.html`.

## 4. Données lues et écrites

Aucune donnée n'est envoyée sur Internet. Tout reste sur l'appareil.

| Donnée | Où | Remarque |
|---|---|---|
| Liste des 440 codes | `const CODES` dans `index.html` | Copie générée de `donnees/codes.json`. |
| Aides (15 entrées) | `const AIDE` dans `index.html` | |
| Table NAT (49 natures) et types de levé | Tableaux HTML de la section `#nat` | Copie générée de `donnees/nat.json`. |
| Secteurs des contrats | localStorage `an.secteurs.v1` | Remplacés au complet à chaque nouveau lien terrain. |
| Secteur choisi | localStorage `an.jour.sect` | Partagé avec l'Accueil (même origine `arpent-nord.github.io`). |
| Copie hors ligne | Cache `pcodes-<version>` | Géré par `sw.js` ; les anciennes versions sont effacées automatiquement. |

### Format du lien terrain

Produit par Gestion des levés : `…/APP-PCodes/#s=z.<base64url>` (JSON compressé deflate-raw) ou `#s=j.<base64url>` (JSON simple).

```
{ "v": 1, "c": "AN-AA-XXX", "n": "<nom du contrat>", "m": "wbs" | "contrat",
  "d": "AAAA-MM-JJ", "s": [["SECT", "description", "WBS?"], …], "a": [["ANCIEN", "NOUVEAU"], …] }
```

Contrôles à l'import : `v = 1`, numéro `AN|MA-AA-XXX(X)`, date valide, secteurs de 4 caractères majuscules ou chiffres. Un lien plus ancien que la liste en place demande une confirmation.

## 5. Place dans la boîte à outils

- Ouvert depuis l'Accueil (premier outil du menu).
- Reçoit les secteurs de **Gestion des levés** (lien terrain).
- Tient la liste maîtresse des codes et de la NAT pour **Collecte GNSS** et **Validation de levé** (copies régénérées).
- Partage le secteur du jour avec l'**Accueil**.
- Le lien « documentation » des liaisons pointe vers le guide de **Validation de levé**.

## 6. Fichiers du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | Application complète (interface, listes, logos intégrés en base64). |
| `donnees/codes.json`, `donnees/nat.json` | Liste maîtresse. |
| `tools/generer.js`, `tools/maj-validation-leve.js` | Régénération des copies. |
| `sw.js` | Fonctionnement hors ligne. |
| `manifest.json` | Installation sur l'écran d'accueil (nom, icônes). |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Icônes d'installation (Android, iPhone). |
| `logo.png` | Ancien logo (gardé pour compatibilité). |
| `docs/CAHIER.md` | Ce cahier. |
| `README.md` | Présentation courte. |

## 7. Publier une nouvelle version

1. Changer le numéro de version aux **trois** endroits :
   - `index.html` : `<meta name="app-version" content="X.Y.Z">` ;
   - `index.html` : `const APP_VERSION = "X.Y.Z";` (fin du fichier) ;
   - `sw.js` : `const VERSION = "X.Y.Z";`. Sans ce changement, les téléphones gardent l'ancienne copie hors ligne.
2. Téléverser les fichiers modifiés dans `Arpent-Nord/APP-PCodes`, branche `main` (Add file → Upload files → Commit directly to main).
3. Attendre le déploiement (Actions → pages-build-deployment), puis recharger avec Ctrl+F5.
4. Créer la release GitHub `vX.Y.Z` avec un titre court.
5. Sur un téléphone déjà installé : à la deuxième ouverture, un bandeau « Nouvelle version prête — Recharger » apparaît.

## 8. Installer sur un téléphone

- **Android (Chrome)** : ouvrir l'adresse, menu ⋮ → « Ajouter à l'écran d'accueil ».
- **iPhone (Safari)** : ouvrir l'adresse, bouton Partager → « Sur l'écran d'accueil ».
- Une icône installée avant le transfert vers `arpent-nord.github.io` pointe vers l'ancienne adresse : la supprimer et réinstaller.

## 9. Règles

- Dépôt **public** : application seulement. Jamais de levé, de plan, de nom de client ni d'employé.
- Bouton standard « ‹ Boîte à outils » en haut à gauche.
- Interface en français.

## 10. En suspens

- Table NAT : quand l'Administration change une nature, mettre `donnees/nat.json` à jour (idéalement un bouton « Exporter nat.json » dans l'Administration).
- Quelques APH partagés par plusieurs codes (FOF, BIN, PYL, ARC, PLA, CON) : à revoir dans la V3.
- Catégorie officielle « Draînage » (accent fautif dans la V2) : à corriger dans la V3.
- Export et réimport des contrats enregistrés sur le téléphone.
- Ajouter 905, 906, 909, 911 et 913 dans la prochaine version du PDF de codes (V3).

## 11. Historique

| Version | Date | Changements |
|---|---|---|
| 2.2.0 | 2026-11-09 | Liste maîtresse `donnees/codes.json` + `nat.json` et scripts de régénération ; descriptions et catégories alignées sur la liste officielle V2 (97 descriptions, 440 catégories) ; anciennes formulations gardées comme mots-clés de recherche. |
| 2.1.0 | 2026-11-09 | Numéro de version affiché ; fonctionnement hors ligne (`sw.js`) ; manifeste relié à la page et icônes d'installation ; bandeau de mise à jour ; cahier et README. |
| 2.0.0 | 2026-11-06 | Aide numérotation et nom du fichier de levé ; code 28 BAL (tous types). |
| — | 2026-10-26/27 | Liaisons, table NAT, Mes contrats, bandeau du jour, logos AN + MECATECH. |
| — | 2026-10-21 | Recherche par APH ; liste alignée sur la liste de codes V2 (440 codes) ; dépôt transféré vers Arpent-Nord. |
| — | 2026-05-14 | Première version. |
