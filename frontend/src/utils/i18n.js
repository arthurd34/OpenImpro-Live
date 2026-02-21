/**
 * Translates a key using the provided dictionary and injects variables.
 * If the key is missing, it returns the key name as a fallback.
 * * @param {Object} ui - The dictionary (gameState.ui)
 * @param {string} key - The translation key (e.g., 'PROPOSAL_SEND')
 * @param {Object} vars - Variables to inject (e.g., { max: 3 })
 */
export const t = (ui, key, vars = {}) => {
    // Safety check: if ui is null or undefined
    if (!ui || !ui[key]) {
        console.warn(`Translation missing for key: ${key}`);
        return key; // Return the key name so the UI doesn't crash
    }

    let str = ui[key];
    Object.keys(vars).forEach(v => {
        str = str.replace(`{{${v}}}`, vars[v]);
    });
    return str;
};