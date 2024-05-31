const fs = require('fs');
const path = require('path');

// Загрузим таблицу соответствия
const mappingFilePath = path.join(__dirname, '../mappingTable.json');
const mappingTable = JSON.parse(fs.readFileSync(mappingFilePath, 'utf8'));

/**
 * Преобразование значения на основе таблицы соответствия
 * @param {string} value - Входное значение
 * @returns {number|string} - Преобразованное числовое значение или исходное значение, если соответствие не найдено
 */
const transformValue = (value) => {
    if (mappingTable[value] !== undefined) {
        return mappingTable[value];
    }
    return value; // Если соответствие не найдено, возвращаем исходное значение
};

module.exports = transformValue;
