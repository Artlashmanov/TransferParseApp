// src/handlers/jsonHandler.js

const parseXML = require('../parseXML');
const generateJSON = require('../generateJSON');
const { logError } = require('../utils/logger');

const processFileAsJSONWithTemplate = (filePath) => {
    parseXML(filePath)
        .then(data => generateJSON(data, templateJSONFilePath, outputFilePath, mapping))
        .catch(err => logError(`Error processing file ${filePath}: ${err}`));
};

module.exports = { processFileAsJSONWithTemplate };
