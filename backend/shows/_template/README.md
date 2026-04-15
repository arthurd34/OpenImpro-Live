# Guide du créateur de spectacle — OpenStage Live

> **Version du template :** voir `_templateVersion` dans `config.json` — voir `CHANGELOG.md` pour l'historique des évolutions.

Ce dossier est un **modèle complet** à copier pour créer votre propre spectacle.  
Renommez le dossier avec l'identifiant de votre show (ex: `mon_spectacle`), modifiez `config.json`, et importez le tout en ZIP depuis l'interface admin.

> Le champ `_templateVersion` dans votre `config.json` est informatif uniquement (il n'est pas lu par le serveur). Il vous permet de savoir sur quelle version du template votre spectacle est basé, et de vous reporter au `CHANGELOG.md` si une nouvelle version du template ajoute des fonctionnalités.

---

## Structure d'un pack spectacle

```
mon_spectacle/
├── config.json          ← Configuration principale (obligatoire)
└── assets/
    ├── logo.png          ← Vos images, sons, polices…
    ├── background.jpg
    ├── screen.css        ← CSS pour le grand écran (optionnel)
    └── mobile.css        ← CSS pour les téléphones (optionnel)
```

Pour importer : compressez **le contenu** du dossier en ZIP (pas le dossier lui-même), puis importez via l'admin.

---

## config.json — Référence complète

### Champs racine

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✅ | Nom affiché dans l'admin et dans l'onglet navigateur des joueurs |
| `lang` | `"fr"` ou `"en"` | ✅ | Langue de l'interface (boutons, messages système) |
| `hasPoints` | boolean | ✅ | Active le système de points et le leaderboard automatique |

---

### `theme` — Apparence visuelle

Tous les champs sont optionnels.

| Champ | Description |
|-------|-------------|
| `primaryColor` | Couleur principale (boutons, accents). Défaut : `#00d4ff` |
| `backgroundColor` | Couleur de fond du grand écran. Défaut : `#1a1a1a` |
| `textColor` | Couleur du texte sur le grand écran. Défaut : `#ffffff` |
| `customCss` | Chemin vers un fichier CSS chargé **uniquement sur le grand écran** |
| `customMobileCss` | Chemin vers un fichier CSS chargé **uniquement sur les téléphones** |

> Les chemins `customCss` et `customMobileCss` sont relatifs au dossier du spectacle (ex: `"assets/screen.css"`).

---

### `assets` — Ressources statiques

Tableau d'objets décrivant les fichiers à utiliser dans les scènes.

```json
{ "id": "logo", "type": "image", "url": "assets/logo.png" }
```

| Champ | Description |
|-------|-------------|
| `id` | Identifiant unique utilisé dans `{{asset:ID}}` |
| `type` | `"image"` ou `"audio"` (pour info, pas utilisé en rendu) |
| `url` | Chemin relatif au dossier du spectacle |

Pour utiliser un asset dans un `customHtml` :
```html
<img src="{{asset:logo}}" />
```

---

### `scenes` — Playlist du spectacle

Liste ordonnée des scènes. L'admin navigue entre elles via les boutons en bas du backoffice.

Si `hasPoints: true`, une scène **Leaderboard** est ajoutée automatiquement à la fin de la playlist.

#### Champs communs à toutes les scènes

| Champ | Description |
|-------|-------------|
| `id` | Identifiant unique (chaîne libre, pas d'espaces recommandé) |
| `title` | Nom affiché dans la playlist de l'admin (emoji autorisés) |
| `type` | Type de scène — voir les types ci-dessous |
| `params` | Paramètres propres au type de scène |
| `uiOverrides` | Surcharges visuelles (fond, HTML custom) — voir ci-dessous |

---

## Types de scènes

### `WAITING` — Écran d'attente

Affiche un message sur le grand écran et sur les téléphones.

```json
{
  "type": "WAITING",
  "params": {
    "titleDisplay": "PAUSE",
    "subTitle": "On revient dans quelques instants !",
    "displayTextOnScreen": true
  }
}
```

| Paramètre | Description |
|-----------|-------------|
| `titleDisplay` | Grand titre affiché. Sur les téléphones : invite à regarder la scène |
| `subTitle` | Sous-titre affiché sous le titre |
| `displayTextOnScreen` | `false` pour masquer le texte sur le grand écran (utile si `customHtml` est défini) |

---

### `PROPOSAL` — Collecte de propositions

Les joueurs soumettent des réponses depuis leur téléphone. L'équipe régie les modère.

```json
{
  "type": "PROPOSAL",
  "params": {
    "titleDisplay": "Devinez la bonne réponse !",
    "subTitle": "Une seule chance !",
    "theme": "Quel est le titre de cette chanson ?",
    "presetDisplayLabel": "✅ La réponse était :",
    "maxProposals": 1,
    "presets": ["Réponse A", "Réponse B", "Réponse C"]
  }
}
```

| Paramètre | Description |
|-----------|-------------|
| `titleDisplay` | Titre affiché sur le téléphone du joueur |
| `subTitle` | Sous-titre affiché sur le téléphone |
| `theme` | Question/thème affiché au-dessus du champ de saisie |
| `maxProposals` | Nombre maximum de propositions par joueur |
| `presets` | Liste de réponses prédéfinies (optionnel). L'admin peut en sélectionner une depuis le backoffice pour l'afficher sur les téléphones et le grand écran |
| `presetDisplayLabel` | Libellé affiché sur le téléphone quand un preset est révélé. Défaut : `"À l'écran :"` |

**Workflow de modération :**
1. Les joueurs envoient leurs propositions
2. Dans le backoffice, l'admin voit toutes les propositions
3. Boutons disponibles : **Afficher** (envoie sur le grand écran), **Gagnant** (marque 🏆), **Supprimer**
4. Si `hasPoints: true` : boutons `+1 +2 +3 +5 -1` pour attribuer des points directement sur une proposition
5. Si des `presets` sont définis : l'admin peut cliquer sur l'un d'eux pour le révéler sur les téléphones

---

### `LEADERBOARD` — Classement

> **Généré automatiquement** si `hasPoints: true` — vous n'avez pas à l'ajouter manuellement.

Affiche le classement sur le grand écran et sur les téléphones (si activé depuis l'admin).  
Les ex-æquo reçoivent le même rang (classement par rang dense).

---

### `PROMO` — Informations / Promo

Affiche du texte et des liens sur le grand écran. Si le contenu dépasse l'écran, il défile automatiquement.

```json
{
  "type": "PROMO",
  "params": {
    "title": "Retrouvez-nous !",
    "lines": [
      "Texte simple sans lien",
      { "text": "📸 Instagram : @mon_compte", "url": "https://instagram.com/mon_compte" },
      { "text": "🌐 mon-site.fr",              "url": "https://mon-site.fr" }
    ]
  }
}
```

| Paramètre | Description |
|-----------|-------------|
| `title` | Titre de la section promo |
| `lines` | Tableau de lignes. Chaque ligne est soit une `string` simple, soit un objet `{text, url}` pour un lien cliquable (sur mobile uniquement — le grand écran affiche le texte sans lien) |

---

## `uiOverrides` — Surcharges visuelles par scène

Optionnel. Permet d'aller plus loin que les `params` standards.

```json
"uiOverrides": {
  "customHtml": "<div style='...'>...</div>",
  "backgroundAsset": "bg_scene",
  "fit": "cover"
}
```

| Champ | Description |
|-------|-------------|
| `customHtml` | HTML arbitraire injecté sur le grand écran à la place du rendu standard. Prioritaire sur tout le reste |
| `backgroundAsset` | `id` d'un asset image à utiliser comme fond de scène (grand écran uniquement) |
| `fit` | Mode de recadrage du fond : `"cover"` (défaut), `"contain"`, `"fill"` |

### Placeholders disponibles dans `customHtml`

| Placeholder | Remplacé par |
|-------------|-------------|
| `{{asset:ID}}` | URL complète de l'asset avec cet `id` |
| `{{titleDisplay}}` | Valeur de `params.titleDisplay` |
| `{{subTitle}}` | Valeur de `params.subTitle` |
| Tout autre `{{clé}}` | Valeur du champ `params.clé` correspondant |

Exemple :
```html
<img src="{{asset:logo}}" /><h1>{{titleDisplay}}</h1>
```

---

## Système de points

Activé par `hasPoints: true`. Permet de gamifier le spectacle.

- **Attribution** : depuis le backoffice → onglet "Attribution des Points" ou directement sur une proposition
- **Visibilité** : le classement peut être affiché sur les téléphones des joueurs via le toggle dans le backoffice
- **Reset** : bouton "Réinitialiser les scores" dans le backoffice
- **Affichage** : scène LEADERBOARD ajoutée automatiquement en fin de playlist

---

## Bonnes pratiques

- Utilisez des `id` de scènes en MAJUSCULES_SANS_ESPACES pour la lisibilité
- Les assets sont servis statiquement — évitez les fichiers trop lourds (images > 2 Mo)
- Le `customHtml` est du HTML brut injecté avec `dangerouslySetInnerHTML` — les styles inline sont recommandés
- Pour tester votre config sans rechargement complet : bouton **🔄 Recharger** dans l'admin (relit le `config.json` depuis le disque)
- Si `lang: "fr"` : tous les messages système (erreurs, boutons) seront en français
