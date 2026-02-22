// backend/src/showManager.js
const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');

/**
 * Path where shows are stored. Each show is a folder
 * containing a config.json and optional assets.
 */
const SHOWS_DIR = path.join(__dirname, '..', 'shows');

// Ensure the shows directory exists
fs.ensureDirSync(SHOWS_DIR);

const ShowManager = {
    /**
     * List all available shows by reading subdirectories in the shows folder
     * @returns {Promise<string[]>} Array of show IDs (folder names)
     */
    listShows: async () => {
        const entries = await fs.readdir(SHOWS_DIR, { withFileTypes: true });
        return entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    },

    /**
     * Upload and extract a show ZIP file
     * @param {Object} file - The file object from express-fileupload
     * @returns {Promise<string>} The extracted showId
     */
    uploadShow: async (file) => {
        const tempPath = path.join(SHOWS_DIR, file.name);

        // Move the ZIP to the shows directory temporarily
        await file.mv(tempPath);

        const zip = new AdmZip(tempPath);
        const showId = path.parse(file.name).name; // folder name = zip name without extension
        const extractPath = path.join(SHOWS_DIR, showId);

        // Extract all files into the show folder
        zip.extractAllTo(extractPath, true);

        // Delete the original ZIP file after extraction
        await fs.remove(tempPath);

        // Basic validation: check if config.json exists in the extracted folder
        if (!await fs.pathExists(path.join(extractPath, 'config.json'))) {
            throw new Error('INVALID_SHOW_PACK: Missing config.json');
        }

        return showId;
    },

    /**
     * Delete a show folder and all its contents
     * @param {string} showId
     */
    deleteShow: async (showId) => {
        const showPath = path.join(SHOWS_DIR, showId);
        await fs.remove(showPath);
    }
};

module.exports = ShowManager;