/**
 * Translates a key and injects variables.
 * Handles both simple string keys and complex objects { key, data }.
 * * @param {Object} ui - The dictionary (gameState.ui)
 * @param {string|Object} message - The translation key or an object { key, data }
 * @param {Object} manualVars - Manual variables to inject (optional)
 */
export const t = (ui, message, manualVars = {}) => {
    // 1. Extract key and variables from the message
    // If message is an object (from server), we extract key and its data
    const isObject = typeof message === 'object' && message !== null;
    const key = isObject ? message.key : message;
    const vars = isObject ? { ...message.data, ...manualVars } : manualVars;

    // 2. Safety check: if ui or key is missing
    if (!ui || !ui[key]) {
        // If we have a string but no translation, return the string
        // If we have an object but no translation, return the key
        return key || "";
    }

    let str = ui[key];

    // 3. Inject variables into the string {{variable}}
    Object.keys(vars).forEach(v => {
        // Use a global regex to replace all occurrences
        str = str.replace(new RegExp(`{{${v}}}`, 'g'), vars[v]);
    });

    return str;
};