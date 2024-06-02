// src/utils/logger.js

const logInfo = (message) => {
    console.log(`[INFO] ${message}`);
};

const logWarning = (message) => {
    console.warn(`[WARNING] ${message}`);
};

const logError = (message) => {
    console.error(`[ERROR] ${message}`);
};

module.exports = { logInfo, logWarning, logError };
