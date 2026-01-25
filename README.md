# OpenImpro Live

**OpenImpro Live** is an open-source platform that connects the audience to live improvisational performances through **real-time interactive modes**, fully moderated by the stage team.

---

## Version française

**OpenImpro Live** est une plateforme open-source qui permet de connecter le public à des spectacles d’improvisation théâtrale grâce à des **modes d’interaction en temps réel**, entièrement modérés par l’équipe de scène.

It is designed as a **toolbox**, not a collection of games.

---

## What is OpenImpro Live?

OpenImpro Live allows an audience to:

* Join a live performance by scanning a **QR code**
* Enter a **short session key** given during the show
* Choose a **display name**
* Interact with the stage in real time

All audience interactions are:

* Collected live
* Moderated by an admin
* Displayed on stage **only after validation**

---

## Modes, not games

OpenImpro Live does **not** provide predefined games.

Instead, it provides **interaction modes** that can be combined, reused, and orchestrated live by the stage team.

Examples of modes:

* **Proposal Mode** – audience submits text proposals
* **Vote Mode** – audience votes on validated proposals
* **Prompt Mode** – audience answers a given instruction
* **Constraint Mode** – audience suggests constraints

A single improvisation exercise can combine multiple modes.

---

## Moderation-first design

> Nothing is ever displayed on stage without admin validation.

Admins can:

* Review all incoming content
* Accept or reject proposals
* Control what is sent to the stage screen
* Switch modes during the performance

This makes OpenImpro Live safe for live audiences.

---

## Applications

OpenImpro Live is composed of multiple applications:

* **Public App** – mobile-first audience interface
* **Admin App** – moderation & show control
* **Screen App** – full-screen stage display
* **Server** – API + real-time communication

All apps communicate in real time via WebSockets.

---

## Plugin-based architecture

Each interaction mode is implemented as a **plugin**.

The core platform does not know the rules of a mode.
It only provides:

* Sessions
* Users & roles
* Real-time events
* Moderation pipeline

Plugins define:

* Audience input UI
* Admin moderation UI
* Screen display UI
* Validation logic

---

## Repository structure (monorepo)

```
openimpro-live/
├─ apps/
│  ├─ public/        # Audience web app
│  ├─ admin/         # Admin interface
│  ├─ screen/        # Stage display
│  └─ server/        # Backend (API + WebSocket)
│
├─ packages/
│  ├─ core/          # Sessions, users, permissions
│  ├─ plugin-sdk/    # Mode/plugin interface
│  └─ ui/            # Shared UI components
│
├─ plugins/
│  └─ proposal/      # Reference mode
│
├─ docs/
│  ├─ architecture.md
│  ├─ plugins.md
│  └─ contributing.md
│
└─ README.md
```

---

## First reference mode

**Proposal Mode** is the first official reference mode.

It allows the audience to:

* Submit text proposals

Admins can:

* Validate or reject proposals

The stage screen displays:

* Validated proposals only

This mode serves as:

* A functional base
* A documentation example
* A template for new modes

---

## Documentation

* Architecture overview → `docs/architecture.md`
* Creating a mode → `docs/plugins.md`
* Contributing guidelines → `docs/contributing.md`

---

## License

OpenImpro Live is released under the **MIT License**.

You are free to use, modify, and distribute it for both private and commercial performances.

---

## Contributing

Contributions are welcome.

Whether you are:

* a developer
* an improv performer
* a stage manager

Your ideas and improvements are encouraged.

---

**OpenImpro Live** – Connect the audience to the stage, live.

---

## Version française (détaillée)

### Qu’est-ce qu’OpenImpro Live ?

OpenImpro Live permet au public de :

* rejoindre un spectacle en scannant un QR code
* entrer une clé de session courte donnée pendant le spectacle
* choisir un nom affiché à l’écran
* interagir avec la scène en temps réel

Toutes les interactions du public sont :

* reçues en direct
* modérées par un administrateur
* affichées sur scène uniquement après validation

---

### Des modes, pas des jeux

OpenImpro Live ne fournit pas de jeux prédéfinis.

Il propose des **modes d’interaction** pouvant être combinés et orchestrés en direct par l’équipe de scène.

Exemples de modes :

* Mode Proposition – le public envoie des propositions textuelles
* Mode Vote – le public vote sur des propositions validées
* Mode Prompt – le public répond à une consigne donnée
* Mode Contrainte – le public propose des contraintes

---

### Modération avant tout

Rien n’est affiché sur scène sans validation préalable.

Les administrateurs peuvent :

* consulter toutes les propositions
* accepter ou refuser le contenu
* contrôler ce qui est envoyé à l’écran
* changer de mode pendant le spectacle

---

### Applications

OpenImpro Live est composé de plusieurs applications :

* Application Public – interface mobile pour le public
* Application Admin – modération et contrôle du spectacle
* Application Écran – affichage plein écran pour la scène
* Serveur – API et communication temps réel

---

### Architecture basée sur des plugins

Chaque mode d’interaction est implémenté sous forme de plugin.

Le cœur de la plateforme gère uniquement :

* les sessions
* les utilisateurs et rôles
* les événements temps réel
* la chaîne de modération

Les plugins définissent :

* l’interface public
* l’interface admin
* l’affichage scène
* la logique de validation

---

### Licence

OpenImpro Live est distribué sous licence MIT.

Vous êtes libre de l’utiliser, le modifier et le redistribuer, y compris pour des usages commerciaux ou culturels.
