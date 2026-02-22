import React from 'react';

const ProposalsScreen = ({ proposals }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            {proposals.map((prop) => (
                <div key={prop.id} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    background: prop.isWinner ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                    borderBottom: proposals.length > 1 ? '2px solid rgba(255,255,255,0.1)' : 'none',
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <div style={{
                        borderLeft: prop.isWinner ? '20px solid #f59e0b' : '20px solid #00d4ff',
                        padding: '20px 60px',
                        textAlign: 'center'
                    }}>
                        <h1 style={{
                            fontSize: proposals.length > 2 ? '5rem' : '8rem',
                            margin: 0,
                            textTransform: 'uppercase',
                            lineHeight: 1.1
                        }}>
                            "{prop.text}"
                        </h1>
                        <h2 style={{ fontSize: '3rem', color: prop.isWinner ? '#f59e0b' : '#00d4ff', marginTop: '20px' }}>
                            {prop.isWinner && '🏆 '} {prop.userName}
                        </h2>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProposalsScreen;