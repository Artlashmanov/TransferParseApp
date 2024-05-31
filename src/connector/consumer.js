const amqp = require('amqplib/callback_api');
const parseXML = require('../parseXML');
const generateXML = require('../generateXML');
const fs = require('fs');

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
            const processedQueue = 'processed_xml_files';

            ch.assertQueue(queue, { durable: true });
            ch.assertQueue(processedQueue, { durable: true });

            ch.consume(queue, async (msg) => {
                if (msg !== null) {
                    const xmlData = msg.content.toString();
                    const data = await parseXML(xmlData);

                    const outputFilePath = 'path/to/output/file.xml';
                    await generateXML(data, outputFilePath);

                    const processedXML = fs.readFileSync(outputFilePath, 'utf8');
                    ch.sendToQueue(processedQueue, Buffer.from(processedXML), { persistent: true });

                    console.log(" [x] Processed and sent %s", outputFilePath);
                    ch.ack(msg);
                }
            }, { noAck: false });
        });
    });
};

module.exports = startConsumer;
