// config.js
module.exports = {
  rabbitMQ: {
    url: 'amqp://artem:321@10.28.0.229',
    host: '10.28.0.229',
    port: 15672,
    user: 'artem',
    password: '321'
  },
  appMetadata: {
    app_id: 'erp-in',
    object_type: 'Item',
    exchange: 'fanout', // Обновленный exchange
    rawQueue: 'raw_xml_files', // Новая очередь для приема "сырых" файлов
    processedQueue: 'scmo_in' // Очередь для отправки обработанных файлов
  }
};
