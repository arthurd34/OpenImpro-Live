# OpenImpro Live

**OpenImpro Live** is an open-source platform that connects the audience to live improvisational performances through **real-time interactive modes**, fully moderated by the stage team.

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

**OpenImpro Live** – *Connect the audience to the stage, live.*
