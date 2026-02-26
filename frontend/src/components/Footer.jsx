import React from 'react';
import { t } from '../utils/i18n';

/**
 * Footer Component
 * Displays version, custom license, and authorship credits.
 */
const Footer = ({ version, ui }) => {
    const currentYear = new Date().getFullYear();
    // [comment] If the year is beyond 2026, show a range, otherwise just 2026
    const displayYear = currentYear > 2026 ? `2026 - ${currentYear}` : '2026';

    return (
        <footer>
            <p style={{ margin: '5px 0' }}>
                <strong>Open Stage Live</strong> {version && `v${version}`}
                <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.5px', opacity: 0.8 }}>
                    License: Commercial Performance Use Permitted
                </span>
            </p>

            <p style={{ margin: '5px 0', fontSize: '75%' }}>
                {t(ui, 'MAKE_BY', 'Réalisé par')} <strong>Déléage Arthur</strong>
            </p>

            <div style={{ marginTop: '10px', fontSize: '65%', fontStyle: 'italic', opacity: 0.5 }}>
                © {displayYear} Open Stage Live. {t(ui, 'FOOTER_ALL_RIGHTS', 'Tous droits réservés')}.
            </div>
        </footer>
    );
};

export default Footer;