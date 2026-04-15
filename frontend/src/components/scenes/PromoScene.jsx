import React from 'react';

const PromoScene = ({ gameState }) => {
    const params = gameState?.currentScene?.params || {};
    const title = params.title || '';
    const lines = params.lines || [];

    return (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
            {title && (
                <h2 style={{ marginBottom: '20px', opacity: 0.9 }}>{title}</h2>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lines.map((line, i) => {
                    const text = typeof line === 'string' ? line : line.text;
                    const url  = typeof line === 'object' ? line.url : null;
                    const inner = (
                        <div key={i} style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${url ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                            fontSize: '1rem',
                            textAlign: 'left',
                            cursor: url ? 'pointer' : 'default'
                        }}>
                            {text}{url && <span style={{ opacity: 0.4, fontSize: '0.8rem', marginLeft: '8px' }}>↗</span>}
                        </div>
                    );
                    return url
                        ? <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>
                        : <React.Fragment key={i}>{inner}</React.Fragment>;
                })}
            </div>
        </div>
    );
};

export default PromoScene;
