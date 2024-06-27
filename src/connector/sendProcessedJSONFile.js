// src/connector/sendProcessedJSONFile.js

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const { logInfo, logError } = require('../utils/logger');
const { rabbitMQ, appMetadata } = require('../../config');

const sendProcessedJSONFile = (jsonFilePath) => {
  logInfo(`Attempting to send file ${jsonFilePath} to RabbitMQ...`);
  amqp.connect(rabbitMQ.url, (err, conn) => {
    if (err) {
      logError(`Failed to connect to RabbitMQ: ${err}`);
      throw err;
    }
    conn.createChannel((err, ch) => {
      if (err) {
        logError(`Failed to create RabbitMQ channel: ${err}`);
        throw err;
      }
      const exchange = appMetadata.exchange;
      const jsonData = fs.readFileSync(jsonFilePath, 'utf8');

      const messageProperties = {
        persistent: true,
        content_type: 'application/json',
        content_encoding: 'utf-8',
        type: appMetadata.object_type,
        app_id: appMetadata.app_id,
        correlation_id: '',
        reply_to: ''
      };

      ch.assertExchange(exchange, 'direct', { durable: true }); // Изменено на 'direct'
      ch.publish(exchange, appMetadata.processedQueue, Buffer.from(jsonData), messageProperties);
      logInfo(` [x] Sent ${jsonFilePath} to exchange ${exchange} with routing key ${appMetadata.processedQueue}`);

      setTimeout(() => {
        conn.close();
      }, 500);
    });
  });
};

module.exports = sendProcessedJSONFile;
