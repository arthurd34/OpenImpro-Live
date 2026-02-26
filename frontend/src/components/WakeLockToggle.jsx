import React, { useState, useEffect } from 'react';
import { t } from '../utils/i18n';

/**
 * WakeLockToggle Component
 * Prevents screen from sleeping using the Screen Wake Lock API.
 * Uses global CSS classes for consistent styling.
 */
const WakeLockToggle = ({ ui }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [wakeLock, setWakeLock] = useState(null);

    const toggleWakeLock = async () => {
        if (!isLocked) {
            try {
                // [comment] Request screen wake lock
                const lock = await navigator.wakeLock.request('screen');
                setWakeLock(lock);
                setIsLocked(true);

                // [comment] If released by system (tab switch, low battery)
                lock.addEventListener('release', () => {
                    setIsLocked(false);
                    setWakeLock(null);
                });
            } catch (err) {
                console.error(`WakeLock Error: ${err.name}, ${err.message}`);
            }
        } else {
            if (wakeLock) {
                wakeLock.release();
                setWakeLock(null);
            }
            setIsLocked(false);
        }
    };

    // [comment] Re-acquire lock if tab becomes visible again and it was active
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (isLocked && document.visibilityState === 'visible') {
                try {
                    const newLock = await navigator.wakeLock.request('screen');
                    setWakeLock(newLock);
                } catch (e) {
                    setIsLocked(false);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isLocked]);

    // [comment] Do not render if the browser doesn't support the API
    if (typeof navigator !== 'undefined' && !('wakeLock' in navigator)) return null;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                userSelect: 'none'
            }}
            title={isLocked ? t(ui, 'WAKE_LOCK_ON') : t(ui, 'WAKE_LOCK_OFF')}
        >
            {/* [comment] Standard switch structure using project CSS classes */}
            <label className="switch">
                <input
                    type="checkbox"
                    checked={isLocked}
                    onChange={toggleWakeLock}
                />
                <span className="slider round"></span>
            </label>

            <small style={{
                fontSize: '0.65rem',
                fontWeight: 'bold',
                color: isLocked ? '#22c55e' : 'white',
                opacity: isLocked ? 1 : 0.6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                pointerEvents: 'none'
            }}>
                {isLocked ? t(ui, 'WAKE_LOCK_ON') : t(ui, 'WAKE_LOCK_OFF')}
            </small>
        </div>
    );
};

export default WakeLockToggle;