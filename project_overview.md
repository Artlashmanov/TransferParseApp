# XML Parser App

Этот проект предназначен для преобразования XML файлов с использованием таблиц соответствия и шаблонов. Приложение наблюдает за папкой входящих XML файлов, обрабатывает их и сохраняет преобразованные файлы в выходную папку.

## Установка

1. Клонируйте репозиторий на ваш локальный компьютер:
    ```sh
    git clone https://github.com/yourusername/xml-parser-app.git
    cd xml-parser-app
    ```

2. Установите необходимые зависимости:
    ```sh
    npm install
    ```

3. Убедитесь, что `pkg` установлен глобально на вашем компьютере:
    ```sh
    npm install -g pkg
    ```

## Сборка

1. Соберите проект с использованием `pkg`:
    ```sh
    pkg . --output myapp.exe
    ```

## Запуск

1. Запустите приложение:
    ```sh
    ./myapp.exe
    ```

## Структура проекта

```plaintext
xml-parser-app/
|-- inputXML/                       # Папка для входящих XML файлов
|-- inputJSON/                      # Папка для входящих JSON файлов (если используется)
|-- output/                         # Папка для выходных файлов
|-- src/                            # Исходный код приложения
|   |-- tags/                       # Логика парсинга для различных тегов
|   |   |-- part.js                 # Логика парсинга тега <Part>
|   |   |-- transformItemPlanningGroup.js # Логика парсинга тега <itemplanninggroup>
|   |   |-- transformItemInventoryGroup.js # Логика парсинга тега <iteminventorygroup>
|   |-- generateJSON.js             # Логика генерации JSON файлов
|   |-- generateXML.js              # Логика генерации XML файлов
|   |-- index.js                    # Главный файл приложения
|   |-- parsePrimaryObjectID.js     # Логика парсинга PrimaryObjectID
|   |-- parseXML.js                 # Логика парсинга XML файлов
|   |-- transformDefineOfSetupYield.js # Логика преобразования данных SetupYield
|   |-- transformDefineOfTestYield.js  # Логика преобразования данных TestYield
|   |-- transformTaskId.js          # Логика преобразования данных TaskId
|   |-- transformValue.js           # Логика преобразования значений
|-- templates/                      # Шаблоны для генерации файлов
|   |-- templateXML.xml             # Шаблон для XML файлов
|   |-- templateJSON.json           # Шаблон для JSON файлов
|-- mapping.json                    # Маппинг для преобразования тегов
|-- mappingTable.json               # Таблица соответствия значений
|-- package.json                    # Зависимости и скрипты для проекта
|-- package-lock.json               # Lock-файл для npm
