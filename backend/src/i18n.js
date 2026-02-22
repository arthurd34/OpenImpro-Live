// backend/src/i18n.js

const translations = {
    fr: {
        // --- CONNECTION SCENE ---
        CONN_WELCOME_TITLE: "Bienvenue !",
        CONN_NOT_STARTED_MSG: "Le spectacle va bientôt commencer. Préparez-vous, les connexions ouvriront d'un instant à l'autre !",
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
        ERROR_JOINS_CLOSED: "Les inscriptions sont fermées.",
        ERROR_SHOW_NOT_STARTED: "Le spectacle n'est pas encore ouvert au public.",
        SHOW_NOT_STARTED: "Spectacle en attente...",

        // --- ADMIN PANEL ---
        ERROR_INVALID_CREDENTIALS: "Identifiants invalides.",
        ADMIN_LOGIN_TITLE: "Accès Régie",
        ADMIN_INPUT_PASS_PH: "Mot de passe",
        ADMIN_REMEMBER_ME: "Se souvenir de moi",
        ADMIN_BTN_LOGIN: "Connexion",
        ADMIN_BTN_LOGOUT: "Déconnexion",
        ADMIN_DASHBOARD_TITLE: "Tableau de Bord",
        ADMIN_CURRENT_SCENE_LABEL: "Scène Actuelle",
        ADMIN_JOINS_OPEN: "Inscriptions Ouvertes",
        ADMIN_JOINS_CLOSED: "Inscriptions Fermées",
        ADMIN_TITLE_REQUESTS: "Demandes ({{count}})",
        ADMIN_TITLE_PLAYERS: "Joueurs ({{count}})",
        ADMIN_EMPTY_LIST: "Aucune donnée disponible",
        ADMIN_BTN_APPROVE: "Accepter",
        ADMIN_BTN_EDIT: "Éditer",
        ADMIN_BTN_KICK: "Exclure",
        ADMIN_PROMPT_RENAME: "Quel est le nouveau nom ?",
        ADMIN_PROMPT_KICK_REASON: "Motif de l'exclusion ?",
        ADMIN_PROMPT_REFUSE_REASON: "Motif du refus ?",
        ADMIN_PROPOSALS_LIVE: "Réponses Public",
        BTN_REFRESH: "Actualiser",
        ADMIN_NO_CONTROLS_FOR_SCENE: "La scène actuelle ({{name}}) n'a pas de contrôles spécifiques.",

        // --- ADMIN SHOW MANAGEMENT ---
        ADMIN_SHOW_CONFIG_TITLE: "Configuration du Show",
        ADMIN_SELECT_SHOW: "Charger un spectacle :",
        ADMIN_SELECT_PH: "-- Choisir un fichier --",
        ADMIN_LIVE_MODE: "Mode LIVE",
        ADMIN_LIVE_ON: "Le spectacle est ouvert (Public autorisé)",
        ADMIN_LIVE_OFF: "Accès public fermé",
        ADMIN_ACCESS_CONTROL: "Contrôle d'Accès",
        ADMIN_BTN_LOAD: "Charger",
        ADMIN_BTN_UPLOAD_ZIP: "Importer un pack (.zip)",
        ADMIN_UPLOADING: "Envoi en cours...",
        ADMIN_UPLOAD_SUCCESS: "Importation réussie !",
        ADMIN_UPLOAD_ERROR: "Erreur lors de l'importation.",
        ADMIN_CONFIRM_DELETE: "Supprimer définitivement ce spectacle ?",
        ADMIN_NO_SHOW_LOADED: "Aucun spectacle chargé. Veuillez charger un spectacle."
    },
    en: {
        // --- CONNECTION SCENE ---
        CONN_WELCOME_TITLE: "Welcome!",
        CONN_NOT_STARTED_MSG: "The show is about to start. Get ready, connections will open at any moment!",
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
        ERROR_JOINS_CLOSED: "Registrations are closed.",
        ERROR_SHOW_NOT_STARTED: "The show is not open to the public yet.",
        SHOW_NOT_STARTED: "Show starting soon...",

        // --- ADMIN PANEL ---
        ERROR_INVALID_CREDENTIALS: "Invalid credentials.",
        ADMIN_LOGIN_TITLE: "Control Room Access",
        ADMIN_INPUT_PASS_PH: "Password",
        ADMIN_REMEMBER_ME: "Remember me",
        ADMIN_BTN_LOGIN: "Login",
        ADMIN_BTN_LOGOUT: "Logout",
        ADMIN_DASHBOARD_TITLE: "Dashboard",
        ADMIN_CURRENT_SCENE_LABEL: "Current Scene",
        ADMIN_JOINS_OPEN: "Registrations Open",
        ADMIN_JOINS_CLOSED: "Registrations Closed",
        ADMIN_TITLE_REQUESTS: "Requests ({{count}})",
        ADMIN_TITLE_PLAYERS: "Players ({{count}})",
        ADMIN_EMPTY_LIST: "No data available",
        ADMIN_BTN_APPROVE: "Approve",
        ADMIN_BTN_EDIT: "Edit",
        ADMIN_BTN_KICK: "Kick",
        ADMIN_PROMPT_RENAME: "What is the new name?",
        ADMIN_PROMPT_KICK_REASON: "Reason for kicking?",
        ADMIN_PROMPT_REFUSE_REASON: "Reason for refusal?",
        ADMIN_PROPOSALS_LIVE: "Public Responses",
        BTN_REFRESH: "Refresh",
        ADMIN_NO_CONTROLS_FOR_SCENE: "The current scene ({{name}}) has no specific controls.",

        // --- ADMIN SHOW MANAGEMENT ---
        ADMIN_SHOW_CONFIG_TITLE: "Show Configuration",
        ADMIN_SELECT_SHOW: "Load a show:",
        ADMIN_SELECT_PH: "-- Select a file --",
        ADMIN_LIVE_MODE: "LIVE Mode",
        ADMIN_LIVE_ON: "Show is live (Public allowed)",
        ADMIN_LIVE_OFF: "Public access closed",
        ADMIN_ACCESS_CONTROL: "Access Control",
        ADMIN_BTN_LOAD: "Load",
        ADMIN_BTN_UPLOAD_ZIP: "Import pack (.zip)",
        ADMIN_UPLOADING: "Uploading...",
        ADMIN_UPLOAD_SUCCESS: "Upload successful!",
        ADMIN_UPLOAD_ERROR: "Error during upload.",
        ADMIN_CONFIRM_DELETE: "Permanently delete this show?",
        ADMIN_NO_SHOW_LOADED: "No show loaded. Please load a show."
    }
};

module.exports = translations;