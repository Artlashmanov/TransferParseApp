#!/usr/bin/env python
import os
import pika
import glob

# Параметры подключения к RabbitMQ
rmq_parameters = pika.URLParameters('amqp://artem:321@10.28.0.229:5672/')
connection = pika.BlockingConnection(rmq_parameters)
channel = connection.channel()

# Объявление очереди
channel.queue_declare(queue='scmo_in', durable=True)

# Директория с файлами
output_dir = 'output'

# Функция для отправки файла в RabbitMQ
def send_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()

    file_extension = os.path.splitext(file_path)[1]
    if file_extension == '.xml':
        content_type = 'application/xml'
    elif file_extension == '.json':
        content_type = 'application/json'
    else:
        return

    channel.basic_publish(
        exchange='input',
        routing_key='',
        body=file_content,
        properties=pika.BasicProperties(
            type='Item',
            app_id='erp_in',
            content_type=content_type
        )
    )

    print(f" [x] Sent file {file_path}")

# Получение списка файлов в директории
files = glob.glob(os.path.join(output_dir, '*'))

# Отправка каждого файла
for file_path in files:
    send_file(file_path)

# Закрытие соединения
connection.close()
