import { useEffect } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

export const useCustomTheme = (gameState, mode = 'screen') => {
    // 1. On extrait les chaînes de caractères (strings) au lieu de l'objet entier.
    // Cela évite que React ne redéclenche le useEffect à chaque mise à jour du state.
    const customCssPath = mode === 'mobile'
        ? gameState?.theme?.customMobileCss
        : gameState?.theme?.customCss;
    const showId = gameState?.activeShowId;

    useEffect(() => {
        const linkId = `custom-show-theme-${mode}`;
        const existingLink = document.getElementById(linkId);

        // Cas A : Aucun thème défini ou aucun show actif -> On nettoie s'il restait un vieux CSS
        if (!customCssPath || !showId) {
            if (existingLink) document.head.removeChild(existingLink);
            return;
        }

        // On construit la nouvelle URL (SANS le Date.now() pour que le navigateur utilise son cache mémoire)
        const newHref = `${backendUrl}/shows/${showId}/${customCssPath}`;

        // Cas B : Le CSS est déjà injecté et c'est EXACTEMENT le même.
        // -> ON NE FAIT RIEN (C'est ça qui empêche le clignotement !)
        if (existingLink && existingLink.getAttribute('href') === newHref) {
            return;
        }

        // Cas C : Le CSS a changé, on retire l'ancien...
        if (existingLink) {
            document.head.removeChild(existingLink);
        }

        // ... et on met le nouveau
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = newHref;
        link.id = linkId;

        document.head.appendChild(link);
        console.log(`[Theme-${mode}] Injected: ${link.href}`);

        // Le cleanup ne s'exécutera qu'au démontage total du composant
        return () => {
            const el = document.getElementById(linkId);
            if (el) document.head.removeChild(el);
        };

        // 2. On met uniquement ces variables simples dans le tableau de dépendances
    }, [customCssPath, showId, mode]);
};