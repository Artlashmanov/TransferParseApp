const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');
const { processFileAsXML } = require('../handlers/xmlHandler');

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
                    const tempDir = path.join(__dirname, '../../inputXML');
                    const tempFilePath = path.join(tempDir, 'temp.xml');

                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                    }

                    fs.writeFileSync(tempFilePath, xmlData);

                    // Процесс обработки файла
                    await processFileAsXML(tempFilePath);

                    ch.ack(msg);
                }
            }, { noAck: false });
        });
    });
};

module.exports = startConsumer;
