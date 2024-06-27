// src/handlers/jsonHandler.js

const parseXML = require('../parseXML');
const generateJSON = require('../generateJSON');
const { logInfo, logError } = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Определите абсолютные пути
const templateJSONFilePath = path.join(__dirname, '../../templates/templateJSON.json');
const outputFilePath = path.join(__dirname, '../../output/');
const mappingFilePath = path.join(__dirname, '../../mapping.json');

// Убедитесь, что файл mapping.json существует
if (!fs.existsSync(mappingFilePath)) {
    throw new Error(`Mapping file not found: ${mappingFilePath}`);
}

// Убедитесь, что файл templateJSON.json существует
if (!fs.existsSync(templateJSONFilePath)) {
    throw new Error(`Template JSON file not found: ${templateJSONFilePath}`);
}

const mapping = require(mappingFilePath);

const processFileAsJSONWithTemplate = (filePath) => {
    logInfo(`Processing JSON file: ${filePath}`);
    parseXML(filePath)
        .then(data => {
            logInfo(`Parsed data: ${JSON.stringify(data)}`);
            return generateJSON(data, templateJSONFilePath, outputFilePath, mapping);
        })
        .catch(err => logError(`Error processing file ${filePath}: ${err}`));
};

module.exports = { processFileAsJSONWithTemplate };
