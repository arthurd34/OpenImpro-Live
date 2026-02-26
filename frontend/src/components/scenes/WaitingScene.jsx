// src/components/scenes/WaitingScene.jsx
import React from 'react';
import { t } from '../../utils/i18n';

const WaitingScene = ({ gameState }) => {
    const { ui, theme, showPath } = gameState;
    const params = gameState?.currentScene?.params ?? {};

    // Construction de l'URL de l'image de fond (si présente dans le thème)
    const bgUrl = theme?.backgroundImage
        ? `${import.meta.env.VITE_BACKEND_URL}${showPath}assets/${theme.backgroundImage}`
        : null;

    console.log(theme?.backgroundImage);
    console.log(bgUrl);

    return (
        <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // Application de l'image de fond préchargée
            backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'var(--text-color, #ffffff)' // Utilise la variable CSS du thème
        }}>

            {/* Conteneur flou pour assurer la lisibilité si il y a un fond image */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '40px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h2 style={{
                    marginBottom: '15px',
                    fontSize: '2.5rem',
                    color: 'var(--primary-color, #00d4ff)' // Titre à la couleur du thème
                }}>
                    {params.titleDisplay || t(ui, 'WAITING_DEFAULT_TITLE')}
                </h2>

                <p style={{ opacity: 0.9, fontSize: '1.2rem' }}>
                    {t(ui, 'WAITING_SUBTITLE')}
                </p>

                {/* Spinner coloré avec la variable du thème */}
                <div
                    className="spinner"
                    style={{
                        marginTop: '30px',
                        marginInline: 'auto',
                        borderTopColor: 'var(--primary-color, #00d4ff)'
                    }}
                ></div>
            </div>
        </div>
    );
};

export default WaitingScene;