// src/connector/sendProcessedXMLFile.js

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const { logInfo, logError } = require('../utils/logger');

const sendProcessedXMLFile = (xmlFilePath) => {
    logInfo(`Attempting to send file ${xmlFilePath} to RabbitMQ...`);
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) {
            logError(`Failed to connect to RabbitMQ: ${err}`);
            throw err;
        }
        conn.createChannel((err, ch) => {
            if (err) {
                logError(`Failed to create RabbitMQ channel: ${err}`);
                throw err;
            }
            const queue = 'processed_xml_files';
            const xmlData = fs.readFileSync(xmlFilePath, 'utf8');

            ch.assertQueue(queue, { durable: true });
            ch.sendToQueue(queue, Buffer.from(xmlData), { persistent: true });
            logInfo(` [x] Sent ${xmlFilePath} to ${queue}`);

            setTimeout(() => {
                conn.close();
            }, 500);
        });
    });
};

module.exports = sendProcessedXMLFile;