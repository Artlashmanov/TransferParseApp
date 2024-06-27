// src/connector/producer.js

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const { rabbitMQ, appMetadata } = require('../../config');

const sendRawXMLFile = (xmlFilePath) => {
  amqp.connect(rabbitMQ.url, (err, conn) => {
    if (err) {
      throw err;
    }
    conn.createChannel((err, ch) => {
      if (err) {
        throw err;
      }
      const xmlData = fs.readFileSync(xmlFilePath, 'utf8');

      const messageProperties = {
        persistent: true,
        content_type: 'application/xml',
        content_encoding: 'utf-8',
        type: appMetadata.object_type,
        app_id: appMetadata.app_id,
        correlation_id: '',
        reply_to: ''
      };

      ch.assertQueue(appMetadata.routing_key, { durable: true });
      ch.sendToQueue(appMetadata.routing_key, Buffer.from(xmlData), messageProperties);
      console.log(` [x] Sent ${xmlFilePath} to ${appMetadata.routing_key}`);

      setTimeout(() => {
        conn.close();
      }, 500);
    });
  });
};

module.exports = sendRawXMLFile;
