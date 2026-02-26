//
import React from 'react';

const LoadingScreen = ({ progress, error, onSkip }) => {
    return (
        <div style={{
            height: '100vh', width: '100vw', backgroundColor: '#000',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '20px'
        }}>
            {!error ? (
                <>
                    <h2 style={{ marginBottom: '20px' }}>PRÉPARATION DU SPECTACLE</h2>
                    <div style={{ width: '300px', height: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
                        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#00d4ff', transition: 'width 0.3s' }} />
                    </div>
                    <p style={{ marginTop: '15px', opacity: 0.6 }}>Chargement... {Math.round(progress)}%</p>
                </>
            ) : (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <h2 style={{ color: '#ff4444' }}>Oups !</h2>
                    <p>Certaines ressources n'ont pas pu être chargées.</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '30px' }}>
                        Cela peut arriver avec une connexion instable.
                    </p>
                    <button
                        onClick={onSkip}
                        className="btn-primary" // Utilise ta classe CSS globale
                        style={{ padding: '15px 30px', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        Continuer quand même
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoadingScreen;