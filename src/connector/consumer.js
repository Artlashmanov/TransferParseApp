const amqp = require('amqplib/callback_api');
const parseXML = require('../parseXML');
const generateXML = require('../generateXML');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const sendProcessedXMLFile = require('./sendProcessedXMLFile'); // Импорт функции отправки обработанных файлов

const processFile = async (filePath) => {
    try {
        const xmlData = fs.readFileSync(filePath, 'utf8');
        const data = await parseXML(xmlData);

        const outputFileName = `${path.basename(filePath, '.xml')}_processed.xml`;
        const outputFilePath = path.join(__dirname, '../output', outputFileName);
        await generateXML(data, outputFilePath);

        // Отправка готового файла в очередь processed_xml_files
        sendProcessedXMLFile(outputFilePath);

        console.log(" [x] Processed and sent %s", outputFilePath);
    } catch (err) {
        console.error(err);
    }
};

const startConsumer = () => {
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) {
            throw err;
        }
        conn.createChannel((err, ch) => {
            if (err) {
                throw err;
            }
            const queue = 'raw_xml_files';

            ch.assertQueue(queue, { durable: true });

            ch.consume(queue, async (msg) => {
                if (msg !== null) {
                    const xmlData = msg.content.toString();
                    const tempFilePath = path.join(__dirname, '../inputXML', 'temp.xml');
                    fs.writeFileSync(tempFilePath, xmlData);

                    await processFile(tempFilePath);

                    ch.ack(msg);
                }
            }, { noAck: false });
        });
    });

    // Наблюдение за папкой inputXML
    const watcher = chokidar.watch(path.join(__dirname, '../inputXML'), {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: true
    });

    watcher.on('add', filePath => {
        console.log(`File ${filePath} has been added`);
        processFile(filePath);
    });
};

module.exports = startConsumer;
