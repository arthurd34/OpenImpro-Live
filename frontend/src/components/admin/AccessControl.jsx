import React from 'react';
import { t } from '../../utils/i18n';

const AccessControl = ({ state, allowJoins, accessConfig, onToggleJoins, onUpdateConfig, onAddCode, onRemoveCode, newCodeInputRef, ui }) => {

    const MAX_CODES = 50;

    // Helper for bulk generation
    const handleGenerateBulk = () => {
        const currentCount = accessConfig.whitelist.length;
        if (currentCount >= MAX_CODES) return alert(`Limit reached (${MAX_CODES} max)`);

        const remaining = MAX_CODES - currentCount;
        const input = prompt(`How many codes to generate? (Max: ${remaining})`, remaining.toString());
        const count = parseInt(input);

        if (isNaN(count) || count <= 0) return;
        const finalCount = Math.min(count, remaining);

        const newCodes = [];
        const existingCodes = accessConfig.whitelist.map(c => c.code);

        for (let i = 0; i < finalCount; i++) {
            let code;
            do {
                code = Math.random().toString(36).substring(2, 6).toUpperCase();
            } while (existingCodes.includes(code) || newCodes.some(c => c.code === code));
            newCodes.push({ code, used: false, playerName: '' });
        }

        onUpdateConfig({ whitelist: [...accessConfig.whitelist, ...newCodes] });
    };

    // Regenerate Public Code randomly
    const handleRegeneratePublicCode = () => {
        if (window.confirm("Regenerate a new public access code?")) {
            const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            onUpdateConfig({ publicCode: newCode });
        }
    };

    // --- DYNAMIC STYLES BASED ON STATUS ---
    const cardStatusStyle = {
        transition: 'all 0.3s ease',
        borderTop: `4px solid ${allowJoins ? '#22c55e' : '#ef4444'}`,
        backgroundColor: allowJoins ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'
    };

    return (
        <section className="card" style={cardStatusStyle}>
            <h3>{t(ui, 'ADMIN_ACCESS_CONTROL')}</h3>

            {/* Registration Toggle */}
            <div className="admin-toggle-row" style={{
                marginBottom: '20px',
                padding: '10px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px'
            }}>
                <label className="switch">
                    <input type="checkbox" checked={allowJoins} onChange={onToggleJoins} />
                    <span className="slider round"></span>
                </label>
                <h4 style={{ margin: 0, color: allowJoins ? '#22c55e' : '#ef4444' }}>
                    {allowJoins ? t(ui, 'ADMIN_JOINS_OPEN') : t(ui, 'ADMIN_JOINS_CLOSED')}
                </h4>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    className={accessConfig.mode === 'PUBLIC' ? 'btn-primary' : ''}
                    style={{ flex: 1 }}
                    onClick={() => onUpdateConfig({ mode: 'PUBLIC' })}
                >
                    {t(ui, 'ADMIN_MODE_PUBLIC')}
                </button>
                <button
                    className={accessConfig.mode === 'WHITELIST' ? 'btn-primary' : ''}
                    style={{ flex: 1 }}
                    onClick={() => onUpdateConfig({ mode: 'WHITELIST' })}
                >
                    {t(ui, 'ADMIN_MODE_WHITELIST')}
                </button>
            </div>

            {accessConfig.mode === 'PUBLIC' ? (
                /* --- PUBLIC MODE UI --- */
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '5px' }}>
                        {t(ui, 'ADMIN_PUBLIC_KEY_LABEL')}
                    </label>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '6px', color: 'var(--primary)', marginBottom: '15px' }}>
                        {accessConfig.publicCode || '----'}
                    </div>
                    <button onClick={handleRegeneratePublicCode} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                        🔄 {t(ui, 'BTN_REFRESH')}
                    </button>
                </div>
            ) : (
                /* --- WHITELIST MODE UI --- */
                <div className="whitelist-manager">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <small style={{ color: accessConfig.whitelist.length >= MAX_CODES ? '#ef4444' : 'inherit', opacity: 0.8 }}>
                            {accessConfig.whitelist.length} / {MAX_CODES} codes
                        </small>

                        <div style={{ display: 'flex', gap: '5px' }}>
                            {accessConfig.whitelist.length > 0 && (
                                <button
                                    className="btn-danger"
                                    style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                                    onClick={() => window.confirm(t(ui, 'CONFIRM_CLEAR_PROPOSALS')) && onUpdateConfig({ whitelist: [] })}
                                >
                                    {t(ui, 'CLEAR_LIST')}
                                </button>
                            )}
                            {accessConfig.whitelist.length < MAX_CODES && (
                                <button
                                    onClick={handleGenerateBulk}
                                    style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                                >
                                    + Bulk
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                        <input
                            ref={newCodeInputRef}
                            className="admin-input"
                            disabled={accessConfig.whitelist.length >= MAX_CODES}
                            placeholder={accessConfig.whitelist.length >= MAX_CODES ? "Full" : t(ui, 'ADMIN_WHITELIST_ADD_PH')}
                            style={{ flex: 1 }}
                            onKeyDown={(e) => e.key === 'Enter' && onAddCode()}
                        />
                        <button onClick={onAddCode} disabled={accessConfig.whitelist.length >= MAX_CODES}>+</button>
                    </div>

                    {/* Scrollable area */}
                    <div style={{
                        maxHeight: '180px',
                        overflowY: 'auto',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '6px',
                        padding: '5px'
                    }}>
                        {accessConfig.whitelist.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.4, padding: '10px', fontSize: '0.8rem' }}>
                                {t(ui, 'ADMIN_WHITELIST_NO_CODES')}
                            </p>
                        ) : (
                            accessConfig.whitelist.map(c => (
                                <div key={c.code} className="user-row small" style={{ marginBottom: '4px', padding: '4px 8px' }}>
                                    <span style={{ fontFamily: 'monospace', color: c.used ? '#22c55e' : 'inherit', fontSize: '0.9rem' }}>
                                        {c.code} {c.used && <small style={{ opacity: 0.5 }}>({c.playerName})</small>}
                                    </span>
                                    <button className="btn-danger" style={{ padding: '0px 6px' }} onClick={() => onRemoveCode(c.code)}>×</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default AccessControl;