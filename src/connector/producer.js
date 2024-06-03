// src/connector/producer.js

const amqp = require('amqplib/callback_api');
const fs = require('fs');

const sendRawXMLFile = (xmlFilePath) => {
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) {
            throw err;
        }
        conn.createChannel((err, ch) => {
            if (err) {
                throw err;
            }
            const queue = 'raw_xml_files';
            const xmlData = fs.readFileSync(xmlFilePath, 'utf8');

            ch.assertQueue(queue, { durable: true });
            ch.sendToQueue(queue, Buffer.from(xmlData), { persistent: true });
            console.log(" [x] Sent %s to %s", xmlFilePath, queue);

            setTimeout(() => {
                conn.close();
            }, 500);
        });
    });
};

module.exports = sendRawXMLFile;
