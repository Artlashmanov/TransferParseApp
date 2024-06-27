// src/index.js

const path = require('path');
const fs = require('fs');
const { watchDirectories } = require('./handlers/fileHandler');
const startConsumer = require('./connector/consumer');
const { logInfo, logError, logWarning } = require('./utils/logger');
const { ensureDirectoryExists } = require('./utils/directoryHelper');

const baseDir = process.cwd();

const inputXMLDir = path.join(baseDir, 'inputXML');
const inputJSONDir = path.join(baseDir, 'inputJSON');
const outputDir = path.join(baseDir, 'output');
const templatesDir = path.join(baseDir, 'templates');
const templateXMLFilePath = path.join(templatesDir, 'templateXML.xml');
const templateJSONFilePath = path.join(templatesDir, 'templateJSON.json');

ensureDirectoryExists(inputXMLDir);
ensureDirectoryExists(inputJSONDir);
ensureDirectoryExists(outputDir);
ensureDirectoryExists(templatesDir);

let templateXMLExists = true;
let templateJSONExists = true;

if (!fs.existsSync(templateXMLFilePath)) {
    logWarning(`Template file not found: ${templateXMLFilePath}`);
    templateXMLExists = false;
}

if (!fs.existsSync(templateJSONFilePath)) {
    logWarning(`Template file not found: ${templateJSONFilePath}`);
    templateJSONExists = false;
}

watchDirectories(inputXMLDir, inputJSONDir, outputDir);
startConsumer(); // Запуск потребителя

logInfo('Watching for file changes in inputXML and inputJSON directories...');
logInfo('Application started successfully.');
