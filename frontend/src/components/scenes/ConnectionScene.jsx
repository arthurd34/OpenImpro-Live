import React from 'react';

const ConnectionScene = ({ name, setName, handleJoin, status, message }) => {

    if (status === 'pending') {
        return (
            <div className="card" style={{ textAlign: 'center' }}>
                <div className="spinner"></div>
                <h3>Demande envoyée !</h3>
                <p>Merci de patienter, une personne va valider votre entrée d'un instant à l'autre...</p>
                <small style={{ opacity: 0.7 }}>Ne rafraîchissez pas la page.</small>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>Rejoindre le spectacle</h2>
            <form onSubmit={handleJoin}>
                <input
                    placeholder="Votre Nom, équipe ou n° de table"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Rejoindre
                </button>
            </form>
            {message && <div className="error-box" style={{ marginTop: '15px' }}>{message}</div>}
        </div>
    );
};

export default ConnectionScene;