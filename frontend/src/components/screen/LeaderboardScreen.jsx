import React from 'react';

const LeaderboardScreen = ({ scores }) => {
    const sortedScores = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8); // Top 8 for screen readability

    return (
        <div style={{ width: '100%', maxWidth: '1200px', padding: '0 40px', animation: 'fadeIn 0.8s ease' }}>
            <h1 style={{
                textAlign: 'center',
                fontSize: '6rem',
                color: '#f59e0b',
                marginBottom: '40px',
                textShadow: '0 0 30px rgba(245,158,11,0.6)',
                textTransform: 'uppercase'
            }}>
                🏆 Classement
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {sortedScores.map(([name, score], index) => (
                    <div key={name} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '25px 50px',
                        background: index === 0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.07)',
                        borderRadius: '15px',
                        border: index === 0 ? '4px solid #f59e0b' : '1px solid rgba(255,255,255,0.2)',
                        fontSize: '3.5rem',
                        animation: `slideUp 0.5s ease forwards ${index * 0.1}s`,
                        opacity: 0
                    }}>
                        <span>{index + 1}. {name}</span>
                        <span style={{ fontWeight: 'bold', color: index === 0 ? '#f59e0b' : '#fff' }}>{score} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardScreen;