const fs = require('fs');
const xml2js = require('xml2js');

/**
 * Функция для парсинга XML файла
 * @param {string} filePath - Путь к XML файлу
 * @returns {Promise<Object>} - Объект с данными из XML файла
 */
const parseXML = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }
            xml2js.parseString(data, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};

module.exports = parseXML;
