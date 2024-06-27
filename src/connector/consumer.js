// src/connector/consumer.js

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');
const { processFileAsXML } = require('../handlers/xmlHandler');
const { processFileAsJSONWithTemplate } = require('../handlers/jsonHandler');
const { rabbitMQ, appMetadata } = require('../../config');

const startConsumer = () => {
  amqp.connect(rabbitMQ.url, (err, conn) => {
    if (err) {
      console.error(`[ERROR] Failed to connect to RabbitMQ: ${err.message}`);
      throw err;
    }
    console.log(`[INFO] Connected to RabbitMQ at ${rabbitMQ.url}`);
    conn.createChannel((err, ch) => {
      if (err) {
        console.error(`[ERROR] Failed to create RabbitMQ channel: ${err.message}`);
        throw err;
      }
      const queue = appMetadata.rawQueue;

      ch.assertQueue(queue, { durable: true });
      console.log(`[INFO] Asserted queue ${queue}`);

      ch.consume(queue, async (msg) => {
        if (msg !== null) {
          console.log(`[INFO] Message received from queue ${queue}`);
          const xmlData = msg.content.toString();
          const tempXMLDir = path.join(__dirname, '../../inputXML');
          const tempJSONDir = path.join(__dirname, '../../inputJSON');
          const tempXMLFilePath = path.join(tempXMLDir, 'temp.xml');
          const tempJSONFilePath = path.join(tempJSONDir, 'temp.xml');

          if (!fs.existsSync(tempXMLDir)) {
            fs.mkdirSync(tempXMLDir, { recursive: true });
          }

          if (!fs.existsSync(tempJSONDir)) {
            fs.mkdirSync(tempJSONDir, { recursive: true });
          }

          fs.writeFileSync(tempXMLFilePath, xmlData);
          fs.writeFileSync(tempJSONFilePath, xmlData);
          console.log(`[INFO] Message saved to ${tempXMLFilePath} and ${tempJSONFilePath}`);

          // Процесс обработки файла
          await processFileAsXML(tempXMLFilePath);
          await processFileAsJSONWithTemplate(tempJSONFilePath);

          ch.ack(msg);
        } else {
          console.log(`[WARNING] Received null message`);
        }
      }, { noAck: false });

      console.log(`[INFO] Waiting for messages in ${queue}`);
    });
  });
};

module.exports = startConsumer;
