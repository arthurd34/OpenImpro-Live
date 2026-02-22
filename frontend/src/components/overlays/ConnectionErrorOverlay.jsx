import React from 'react';
import { t } from '../../utils/i18n';

const ConnectionErrorOverlay = ({ ui, countdown, onRefresh }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, textAlign: 'center', padding: '20px'
    }}>
        <div className="spinner"></div>
        <h2 style={{ color: '#e74c3c' }}>{t(ui, 'CONNECTION_LOST')}</h2>
        <p>{t(ui, 'RECONNECTING')}</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {t(ui, 'REFRESH_IN')} <strong>{countdown}s</strong>
        </p>
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={onRefresh}>
            {t(ui, 'REFRESH_NOW')}
        </button>
    </div>
);

export default ConnectionErrorOverlay;