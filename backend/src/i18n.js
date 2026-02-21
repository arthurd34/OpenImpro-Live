const translations = {
    fr: {
        // --- CONNECTION SCENE ---
        CONN_JOIN_TITLE: "Rejoindre le spectacle",
        CONN_INPUT_PLACEHOLDER: "Votre Nom, équipe ou n° de table",
        CONN_BTN_JOIN: "Rejoindre",
        CONN_PENDING_TITLE: "Demande envoyée !",
        CONN_PENDING_MSG: "Merci de patienter, une personne va valider votre entrée d'un instant à l'autre...",
        CONN_DONT_REFRESH: "Ne rafraîchissez pas la page.",

        // --- PROPOSAL SCENE ---
        PROPOSAL_TITLE_SINGLE: "Ma proposition",
        PROPOSAL_TITLE_PLURAL: "Mes propositions : {{count}} / {{max}}",
        PROPOSAL_INPUT_PLACEHOLDER: "Entrez votre proposition...",
        PROPOSAL_LIMIT_MSG: "Seulement {{max}} proposition(s) autorisée(s)",
        PROPOSAL_SEND: "Envoyer",
        PROPOSAL_EMPTY_HISTORY: "Vous n'avez pas encore envoyé de proposition.",
        PROPOSAL_WINNER_ICON: "🏆",

        // --- WAITING SCENE ---
        WAITING_DEFAULT_TITLE: "Attente du prochain jeu...",
        WAITING_SUBTITLE: "Regardez l'écran de scène !",
        WAITING_FOR_START: "Connecté ! Attente du début...",

        // --- OVERLAYS & ERRORS ---
        CONNECTION_LOST: "Connexion perdue",
        RECONNECTING: "Tentative de reconnexion...",
        REFRESH_IN: "Actualisation automatique dans",
        REFRESH_NOW: "Actualiser maintenant",
        ERROR_NAME_TAKEN: "Ce nom est déjà utilisé.",
        ERROR_SESSION_EXPIRED: "Session expirée.",

        // --- ADMIN PANEL ---
        ADMIN_TITLE: "Gestion Live",
        ADMIN_STATUS_ONLINE: "Serveur Online",
        ADMIN_SCENE_SELECT: "Scène Actuelle",
        ADMIN_JOINS_OPEN: "Inscriptions Ouvertes",
        ADMIN_JOINS_CLOSED: "Inscriptions Fermées",
        ADMIN_PENDING_REQ: "Demandes",
        ADMIN_PLAYERS_ONLINE: "Joueurs en ligne",
        ADMIN_EMPTY_LIST: "Aucune donnée disponible",
        ADMIN_CLEAR_LIST: "VIDER LA LISTE",
        ADMIN_PROPOSALS_LIVE: "Réponses Public"
    },
    en: {
        // --- CONNECTION SCENE ---
        CONN_JOIN_TITLE: "Join the show",
        CONN_INPUT_PLACEHOLDER: "Your Name, team or table number",
        CONN_BTN_JOIN: "Join",
        CONN_PENDING_TITLE: "Request sent!",
        CONN_PENDING_MSG: "Please wait, someone will validate your entry any moment now...",
        CONN_DONT_REFRESH: "Do not refresh the page.",

        // --- PROPOSAL SCENE ---
        PROPOSAL_TITLE_SINGLE: "My proposal",
        PROPOSAL_TITLE_PLURAL: "My proposals: {{count}} / {{max}}",
        PROPOSAL_INPUT_PLACEHOLDER: "Type your idea...",
        PROPOSAL_LIMIT_MSG: "Only {{max}} proposal(s) allowed",
        PROPOSAL_SEND: "Send",
        PROPOSAL_EMPTY_HISTORY: "You haven't sent any proposals yet.",
        PROPOSAL_WINNER_ICON: "🏆",

        // --- WAITING SCENE ---
        WAITING_DEFAULT_TITLE: "Waiting for the next game...",
        WAITING_SUBTITLE: "Look at the main screen!",
        WAITING_FOR_START: "Connected! Waiting to start...",

        // --- OVERLAYS & ERRORS ---
        CONNECTION_LOST: "Connection lost",
        RECONNECTING: "Reconnecting...",
        REFRESH_IN: "Automatic refresh in",
        REFRESH_NOW: "Refresh now",
        ERROR_NAME_TAKEN: "This name is already taken.",
        ERROR_SESSION_EXPIRED: "Session expired.",

        // --- ADMIN PANEL ---
        ADMIN_TITLE: "Live Management",
        ADMIN_STATUS_ONLINE: "Server Online",
        ADMIN_SCENE_SELECT: "Current Scene",
        ADMIN_JOINS_OPEN: "Registrations Open",
        ADMIN_JOINS_CLOSED: "Registrations Closed",
        ADMIN_PENDING_REQ: "Requests",
        ADMIN_PLAYERS_ONLINE: "Online Players",
        ADMIN_EMPTY_LIST: "No data available",
        ADMIN_CLEAR_LIST: "CLEAR LIST",
        ADMIN_PROPOSALS_LIVE: "Public Responses"
    }
};

module.exports = translations;