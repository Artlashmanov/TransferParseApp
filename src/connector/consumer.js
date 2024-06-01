const amqp = require('amqplib/callback_api');
const parseXML = require('../parseXML');
const generateXML = require('../generateXML');
const fs = require('fs');
const path = require('path');

const sendProcessedXMLFile = require('./sendProcessedXMLFile'); // Импорт функции отправки обработанных файлов

const processFile = async (filePath) => {
    try {
        const xmlData = fs.readFileSync(filePath, 'utf8');
        const data = await parseXML(xmlData);

        const outputFileName = `${path.basename(filePath, '.xml')}_processed.xml`;
        const outputFilePath = path.join(__dirname, '../../output', outputFileName); // Убедитесь, что путь ведет к корню проекта
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
                    const tempDir = path.join(__dirname, '../../inputXML'); // Убедитесь, что путь ведет к корню проекта
                    const tempFilePath = path.join(tempDir, 'temp.xml');

                    // Проверка существования директории inputXML и создание, если она не существует
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                    }

                    fs.writeFileSync(tempFilePath, xmlData);

                    await processFile(tempFilePath);

                    ch.ack(msg);
                }
            }, { noAck: false });
        });
    });
};

module.exports = startConsumer;
