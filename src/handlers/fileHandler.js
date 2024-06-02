// src/handlers/fileHandler.js

const chokidar = require('chokidar');
const { processFileAsXML, processFileAsJSONWithTemplate } = require('./xmlHandler');
const { logInfo, logError } = require('../utils/logger');
const { ensureDirectoryExists } = require('../utils/directoryHelper');
const sendProcessedXMLFile = require('../connector/sendProcessedXMLFile');

const watchDirectories = (inputXMLDir, inputJSONDir, outputDir) => {
    ensureDirectoryExists(inputXMLDir);
    ensureDirectoryExists(inputJSONDir);
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

module.exports = { watchDirectories };
