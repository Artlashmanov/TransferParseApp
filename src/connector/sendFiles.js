// src/connector/sendFiles.js

const fs = require('fs').promises;
const path = require('path');
const amqp = require('amqplib');
const { logInfo, logError } = require('../utils/logger');
const { rabbitMQ } = require('../../config');

const outputDir = path.join(__dirname, '../../output'); // путь к директории output

const sendFileToRabbitMQ = async (filePath) => {
    try {
        const conn = await amqp.connect(rabbitMQ.url);
        const ch = await conn.createChannel();
        const queue = 'scmo_in'; // Объявление очереди
        const fileName = path.basename(filePath);
        const fileContent = await fs.readFile(filePath, 'utf8');

        const fileExtension = path.extname(filePath);
        let contentType;
        if (fileExtension === '.xml') {
            contentType = 'application/xml';
        } else if (fileExtension === '.json') {
            contentType = 'application/json';
        } else {
            return; // Пропускаем файлы с неизвестным расширением
        }

        await ch.assertQueue(queue, { durable: true });

        ch.sendToQueue(queue, Buffer.from(fileContent), {
            persistent: true,
            contentType: contentType,
            type: 'Item',
            appId: 'erp_in'
        });

        logInfo(`File ${fileName} sent to RabbitMQ queue ${queue}`);

        setTimeout(() => {
            conn.close();
        }, 500);
    } catch (error) {
        logError(`Error sending file ${filePath}: ${error.message}`);
    }
};

const sendFiles = async () => {
    try {
        const files = await fs.readdir(outputDir);

        for (const file of files) {
            const filePath = path.join(outputDir, file);
            await sendFileToRabbitMQ(filePath);
        }
    } catch (error) {
        logError(`Error reading output directory: ${error.message}`);
    }
};

sendFiles();
