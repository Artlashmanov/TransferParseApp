// src/handlers/fileHandler.js

const chokidar = require('chokidar');
const { processFileAsXML, processFileAsJSONWithTemplate } = require('./xmlHandler');
const { readExcelFile, writeExcelFile } = require('./excelHandler'); // Добавим обработчики Excel
const { logInfo, logError } = require('../utils/logger');
const { ensureDirectoryExists } = require('../utils/directoryHelper');
const sendProcessedXMLFile = require('../connector/sendProcessedXMLFile');
const path = require('path');

const watchDirectories = (inputXMLDir, inputJSONDir, inputXLSXDir, outputDir, templateExcelPath) => {
    ensureDirectoryExists(inputXMLDir);
    ensureDirectoryExists(inputJSONDir);
    ensureDirectoryExists(inputXLSXDir); // Убедимся, что директория существует
    ensureDirectoryExists(outputDir);

    const watcherXML = chokidar.watch(inputXMLDir, {
        persistent: true,
        ignoreInitial: false,
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    const watcherJSON = chokidar.watch(inputJSONDir, {
        persistent: true,
        ignoreInitial: false,
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    const watcherXLSX = chokidar.watch(inputXLSXDir, {
        persistent: true,
        ignoreInitial: false,
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    const watcherOutput = chokidar.watch(outputDir, {
        persistent: true,
        ignoreInitial: false,
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    watcherXML
        .on('add', filePath => {
            logInfo(`XML file ${filePath} has been added.`);
            processFileAsXML(filePath);
        })
        .on('change', filePath => processFileAsXML(filePath))
        .on('error', error => logError(`Watcher error: ${error}`));

    watcherJSON
        .on('add', filePath => logInfo(`JSON file ${filePath} has been added.`))
        .on('change', filePath => processFileAsJSONWithTemplate(filePath))
        .on('error', error => logError(`Watcher error: ${error}`));

    watcherXLSX
        .on('add', filePath => {
            logInfo(`XLSX file ${filePath} has been added.`);
            processFileAsXLSX(filePath, outputDir, templateExcelPath); // Обработка Excel файла
        })
        .on('change', filePath => processFileAsXLSX(filePath, outputDir, templateExcelPath))
        .on('error', error => logError(`Watcher error: ${error}`));

    watcherOutput
        .on('add', filePath => {
            logInfo(`Output file ${filePath} has been added.`);
            sendProcessedXMLFile(filePath);
        })
        .on('change', filePath => {
            logInfo(`Output file ${filePath} has been changed.`);
            sendProcessedXMLFile(filePath);
        })
        .on('error', error => logError(`Watcher error: ${error}`));
};

const processFileAsXLSX = (filePath, outputDir, templateExcelPath) => {
    const data = readExcelFile(filePath);
    const outputFilePath = path.join(outputDir, path.basename(filePath));
    writeExcelFile(data, templateExcelPath, outputFilePath);
    logInfo(`Processed and saved: ${outputFilePath}`);
};

module.exports = { watchDirectories };
