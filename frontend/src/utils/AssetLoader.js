/**
 *
 * Utilitaire de préchargement avec gestion de tentatives (retry)
 */

const loadWithRetry = async (asset, url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await new Promise((resolve, reject) => {
                if (asset.type === 'image') {
                    const img = new Image();
                    img.src = url;
                    img.onload = resolve;
                    img.onerror = reject;
                } else if (asset.type === 'audio') {
                    const audio = new Audio();
                    audio.src = url;
                    // On utilise oncanplaythrough pour s'assurer que le son est bufferisé
                    audio.oncanplaythrough = resolve;
                    audio.onerror = reject;
                    audio.load();
                } else {
                    resolve();
                }
            });
        } catch (err) {
            const isLastRetry = i === retries - 1;
            console.warn(
                `[Preloader] Tentative ${i + 1}/${retries} échouée pour : ${asset.id} ${
                    isLastRetry ? '(ABANDON)' : '(Nouvelle tentative...)'
                }`
            );
            if (isLastRetry) throw err;
        }
    }
};

export const preloadAssets = async (assets, basePath, onProgress) => {
    let loaded = 0;
    const total = assets.length;

    console.log(`[Preloader] Démarrage du chargement de ${total} assets...`);

    const promises = assets.map(async (asset) => {
        const url = basePath + asset.url;

        try {
            console.log(`[Preloader] Chargement de : ${asset.id}...`);
            await loadWithRetry(asset, url, 3);

            loaded++;
            console.log(`[Preloader] Succès (${loaded}/${total}) : ${asset.id}`);

            if (onProgress) {
                onProgress((loaded / total) * 100, asset.id);
            }
        } catch (err) {
            console.error(`[Preloader] Échec définitif pour l'asset : ${asset.id}`);
            // On rejette la promesse globale pour déclencher l'affichage du bouton "Continuer quand même"
            throw err;
        }
    });

    return Promise.all(promises);
};