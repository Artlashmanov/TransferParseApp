# XML Parser App

Этот проект предназначен для преобразования XML файлов с использованием таблиц соответствия и шаблонов. Приложение наблюдает за папкой входящих XML файлов, обрабатывает их и сохраняет преобразованные файлы в выходную папку.

## Установка

1. Клонируйте репозиторий на ваш локальный компьютер:
    ```sh
    git clone https://github.com/Artlashmanov/TransferParseApp.git
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

Идея моего проекта такова, в системе есть две программы, одна программа выгружает файлы xml формата в непригодном виде, есть вторая программа учёта в которую надо загрузить эти файлы но перед этим надо преобразовать их в приемлемый формат тоже в xml но уже с другими тегами, что и делает это приложение которое ты видел выше, я задумал так : программа эмитент выпускает неготовый файл xml далее rabbitmq забирает этот файл и передаёт его в моё приложение, далее моё приложение подготавливает этот файл xml и далее rabbitmq забирает этот файл уже готовый и передаёт его в программу учёта.