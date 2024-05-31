// src/tags/part.js
const fs = require('fs');
const path = require('path');

// Загрузим таблицу соответствия
const mappingFilePath = path.join(__dirname, '../../mappingTable.json');
const mappingTable = JSON.parse(fs.readFileSync(mappingFilePath, 'utf8'));

const findTag = (obj, tagName) => {
    if (!obj || typeof obj !== 'object') return null;
    if (obj[tagName]) return obj[tagName][0];
    for (let key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
            const result = findTag(obj[key], tagName);
            if (result) return result;
        }
    }
    return null;
};

const transformValue = (value) => {
    if (mappingTable[value] !== undefined) {
        return mappingTable[value];
    }
    return value; // Если соответствие не найдено, возвращаем исходное значение
};

const parsePartTag = (xmlData) => {
    const part = findTag(xmlData, 'Part');
    if (!part) {
        throw new Error('Part tag not found');
    }

    const name = findTag(part, 'Name') || '00000';
    const number = findTag(part, 'Number') || '00000';
    const defaultUnit = findTag(part, 'DefaultUnit') || '00000';
    const tip = findTag(part, 'TIP') || '00000';
    const state = findTag(part, 'State') || '00000';

    const transformedData = {
        name: number,
        description: name,
        um: {
            id: defaultUnit,
            key: defaultUnit,
            objectName: 'UnitMeasure'
        },
        itemtype: {
            id: transformValue(tip),
            key: transformValue(tip),
            objectName: 'ItemType'
        },
        status: {
            id: transformValue(state),
            key: transformValue(state),
            objectName: 'Status'
        }
    };

    return transformedData;
};

module.exports = {
    findTag,
    parsePartTag
};
