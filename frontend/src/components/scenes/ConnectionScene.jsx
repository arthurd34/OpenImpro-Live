import React from 'react';
import { t } from '../../utils/i18n';

const ConnectionScene = ({ name, setName, handleJoin, status, message, ui }) => {

    // --- Loading State: Waiting for Admin approval ---
    if (status === 'pending') {
        return (
            <div className="card" style={{ textAlign: 'center' }}>
                <div className="spinner"></div>
                <h3>{t(ui, 'CONN_PENDING_TITLE')}</h3>
                <p>{t(ui, 'CONN_PENDING_MSG')}</p>
                <small style={{ opacity: 0.7 }}>{t(ui, 'CONN_DONT_REFRESH')}</small>
            </div>
        );
    }

    // --- Default State: Login Form ---
    return (
        <div className="card">
            <h2>{t(ui, 'CONN_JOIN_TITLE')}</h2>
            <form onSubmit={handleJoin}>
                <input
                    placeholder={t(ui, 'CONN_INPUT_PLACEHOLDER')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    {t(ui, 'CONN_BTN_JOIN')}
                </button>
            </form>

            {/* Display potential error messages (like "Name already taken") */}
            {message && (
                <div className="error-box" style={{ marginTop: '15px' }}>
                    {/* Note: message is usually a key sent by server like ERROR_NAME_TAKEN
                        We try to translate it, if not found, it displays the raw message
                    */}
                    {t(ui, message)}
                </div>
            )}
        </div>
    );
};

export default ConnectionScene;