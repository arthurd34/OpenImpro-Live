import { useEffect } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

export const useAssetPreloader = (gameState) => {
    useEffect(() => {
        if (!gameState?.assets || !gameState?.activeShowId) return;

        // [comment] Iterate through all assets and load images into browser cache
        gameState.assets.forEach(asset => {
            if (asset.type === 'image' && asset.url) {
                const img = new Image();
                img.src = `${backendUrl}/shows/${gameState.activeShowId}/${asset.url}`;
                img.onload = () => console.log(`[Cache] Asset loaded: ${asset.id}`);
                img.onerror = () => console.warn(`[Cache] Failed to load: ${asset.url}`);
            }
        });
    }, [gameState?.activeShowId, gameState?.assets]);
};