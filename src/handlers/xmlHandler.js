// src/handlers/xmlHandler.js

const parseXML = require('../parseXML');
const generateXML = require('../generateXML');
const { logError, logInfo } = require('../utils/logger');
const sendProcessedXMLFile = require('../connector/sendProcessedXMLFile');
const path = require('path');
const fs = require('fs');

const processFileAsXML = async (filePath) => {
    try {
        logInfo(`Starting to process file: ${filePath}`);
        const data = await parseXML(filePath);

        logInfo(`Parsed data: ${JSON.stringify(data)}`);

        const outputFileName = `${path.basename(filePath, '.xml')}_processed.xml`;
        const outputFilePath = path.join(__dirname, '../../output', outputFileName);

        const templateXMLFilePath = path.join(__dirname, '../../templates/templateXML.xml');
        await generateXML(data, templateXMLFilePath, outputFilePath);

        logInfo(`Processed and saved to: ${outputFilePath}`);

        // Проверка существования файла перед отправкой
        if (fs.existsSync(outputFilePath)) {
            sendProcessedXMLFile(outputFilePath);
        } else {
            logError(`Output file does not exist: ${outputFilePath}`);
        }
    } catch (err) {
        logError(`Error processing file ${filePath}: ${err}`);
    }
};

module.exports = { processFileAsXML };
