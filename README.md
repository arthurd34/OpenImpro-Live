# OpenImpro Live (Beta V1)

OpenImpro Live is an open-source platform designed to connect the audience to live improvisational performances through real-time interactive modes, fully moderated by the stage team.

---

## Version Francaise

OpenImpro Live est une plateforme open-source qui permet de connecter le public a des spectacles d'improvisation theatrale grace a des modes d'interaction en temps reel, entierement moderes par l'equipe de scene.

---

## What is OpenImpro Live?

OpenImpro Live allows an audience to:
* Join a live performance using a local network IP.
* Choose a display name.
* Submit proposals or proposals in real time.

All audience interactions are:
* Collected live via WebSockets.
* Filtered and moderated by an admin.
* Displayed on the stage screen only after validation.

---

## Features (V1 Beta)

* Moderation-first design: Nothing is displayed without admin approval.
* Real-time communication: Powered by Socket.io.
* Session recovery: Automatic reconnection for users if the browser is closed.
* Duplicate name protection: Prevents two users from using the same identity.
* Live Tools: Mark winners, delete individual proposals, or clear history.
* Timestamps: Precision tracking of every audience submission.

---

## Applications

The project is composed of four main components:
1. Public App: Mobile interface for the audience.
2. Admin App: Control panel for moderation and show management.
3. Screen App: Full-screen display for the stage projector.
4. Server: Node.js backend handling logic and real-time events.

---

## Installation and Quick Start

### Prerequisites
* Docker and Docker Compose installed.

### Setup
1. Clone the repository.
2. Create a .env file in the /backend folder:
   PORT=3000
   ADMIN_PASSWORD=your_secure_password
3. Build and launch the containers:
   docker-compose up --build

### Access
* Public Interface: http://[YOUR_PC_IP]:5173
* Admin Interface: http://[YOUR_PC_IP]:5173/admin
* Screen Display: http://[YOUR_PC_IP]:5173/screen

---

## Interaction Modes

OpenImpro Live provides interaction modes that can be combined and orchestrated live:
* Waiting Mode: Displays the main title or logo.
* Proposal Mode: Allows the audience to submit text (proposals, constraints, blind test proposals).

---

## Repository Structure

openimpro-live/
|-- backend/       # Node.js Server (API & Socket.io)
|-- frontend/      # React Vite App (Public, Admin, Screen views)
|-- docker-compose.yml
|-- LICENSE
|-- README.md

---

## License

Copyright (c) 2026 [Your Name / Group Name]

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).

* Non-Commercial: You may not use this material for commercial purposes.
* Attribution: You must give appropriate credit.
* ShareAlike: If you remix, transform, or build upon the material, you must distribute your contributions under the same license.

Full legal text is available in the LICENSE file.

---

OpenImpro Live - Connect the audience to the stage, live.