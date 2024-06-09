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
const inputXLSXDir = path.join(baseDir, 'inputXLSX'); // Добавляем директорию для входных Excel файлов
const outputDir = path.join(baseDir, 'output');
const templatesDir = path.join(baseDir, 'templates');
const templateXMLFilePath = path.join(templatesDir, 'templateXML.xml');
const templateJSONFilePath = path.join(templatesDir, 'templateJSON.json');
const templateExcelPath = path.join(templatesDir, 'templateExcel.xlsx'); // Путь к шаблону Excel

ensureDirectoryExists(inputXMLDir);
ensureDirectoryExists(inputJSONDir);
ensureDirectoryExists(inputXLSXDir); // Создаем директорию, если её нет
ensureDirectoryExists(outputDir);
ensureDirectoryExists(templatesDir);

let templateXMLExists = true;
let templateJSONExists = true;
let templateExcelExists = true; // Проверка существования шаблона Excel

if (!fs.existsSync(templateXMLFilePath)) {
    logWarning(`Template file not found: ${templateXMLFilePath}`);
    templateXMLExists = false;
}

if (!fs.existsSync(templateJSONFilePath)) {
    logWarning(`Template file not found: ${templateJSONFilePath}`);
    templateJSONExists = false;
}

if (!fs.existsSync(templateExcelPath)) {
    logWarning(`Template file not found: ${templateExcelPath}`);
    templateExcelExists = false;
}

watchDirectories(inputXMLDir, inputJSONDir, inputXLSXDir, outputDir, templateExcelPath);
startConsumer();

logInfo('Watching for file changes in inputXML, inputJSON, and inputXLSX directories...');
logInfo('Application started successfully.');
