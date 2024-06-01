const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const parseXML = require('./parseXML');
const generateXML = require('./generateXML');
const generateJSON = require('./generateJSON');
const startConsumer = require('./connector/consumer');
const sendRawXMLFile = require('./connector/producer');  // Импорт функции sendRawXMLFile
const sendProcessedXMLFile = require('./connector/sendProcessedXMLFile'); // Импорт функции sendProcessedXMLFile

// Определение текущей директории исполняемого файла
const baseDir = process.cwd();

// Версия приложения
const appVersion = '1.0.0';  // Установите версию вручную

// Определение путей к директориям и файлам
const inputXMLDir = path.join(baseDir, 'inputXML');
const inputJSONDir = path.join(baseDir, 'inputJSON');
const outputDir = path.join(baseDir, 'output');
const templateXMLFilePath = path.join(baseDir, 'templates', 'templateXML.xml');
const templateJSONFilePath = path.join(baseDir, 'templates', 'templateJSON.json');
const mappingFilePath = path.join(baseDir, 'mapping.json');

let mapping;
try {
    mapping = JSON.parse(fs.readFileSync(mappingFilePath, 'utf8'));
} catch (err) {
    console.error('Failed to load mapping.json:', err);
    process.exit(1); // Завершить процесс, если не удалось загрузить файл mapping.json
}

// Функция для обработки XML файла и генерации XML
const processFileAsXML = (filePath) => {
    parseXML(filePath)
        .then(data => {
            const fileName = path.basename(filePath, path.extname(filePath)) + '.xml';
            const outputFilePath = path.join(outputDir, fileName);
            generateXML(data, templateXMLFilePath, outputFilePath, mapping);
        })
        .catch(err => {
            console.error(`Error processing file ${filePath}:`, err);
        });
};

// Функция для обработки XML файла и генерации JSON с использованием шаблона
const processFileAsJSONWithTemplate = (filePath) => {
    parseXML(filePath)
        .then(data => {
            const fileName = path.basename(filePath, path.extname(filePath)) + '.json';
            const outputFilePath = path.join(outputDir, fileName);
            generateJSON(data, templateJSONFilePath, outputFilePath, mapping);
        })
        .catch(err => {
            console.error(`Error processing file ${filePath}:`, err);
        });
};

// Проверка существования директорий inputXML, inputJSON и output
if (!fs.existsSync(inputXMLDir)) {
    fs.mkdirSync(inputXMLDir);
}

if (!fs.existsSync(inputJSONDir)) {
    fs.mkdirSync(inputJSONDir);
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Наблюдение за папками inputXML и inputJSON
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

watcherXML
    .on('add', filePath => {
        console.log(`XML file ${filePath} has been added.`);
        processFileAsXML(filePath);
    })
    .on('change', filePath => {
        console.log(`XML file ${filePath} has been changed.`);
        processFileAsXML(filePath);
    })
    .on('unlink', filePath => {
        console.log(`XML file ${filePath} has been removed.`);
    })
    .on('error', error => {
        console.error(`Watcher error: ${error}`);
    });

watcherJSON
    .on('add', filePath => {
        console.log(`JSON file ${filePath} has been added.`);
        processFileAsJSONWithTemplate(filePath);
    })
    .on('change', filePath => {
        console.log(`JSON file ${filePath} has been changed.`);
        processFileAsJSONWithTemplate(filePath);
    })
    .on('unlink', filePath => {
        console.log(`JSON file ${filePath} has been removed.`);
    })
    .on('error', error => {
        console.error(`Watcher error: ${error}`);
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

watcherOutput
    .on('add', filePath => {
        console.log(`Processed file ${filePath} has been added.`);
        sendProcessedXMLFile(filePath);  // Отправка обработанного файла в очередь processed_xml_files
    })
    .on('change', filePath => {
        console.log(`Processed file ${filePath} has been changed.`);
        sendProcessedXMLFile(filePath);  // Отправка обработанного файла в очередь processed_xml_files
    })
    .on('unlink', filePath => {
        console.log(`Processed file ${filePath} has been removed.`);
    })
    .on('error', error => {
        console.error(`Watcher error: ${error}`);
    });

startConsumer();
console.log(`Watching for file changes in inputXML and inputJSON directories...`);
console.log(`Application version: ${appVersion}`);
