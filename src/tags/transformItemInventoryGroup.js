// src/tags/transformItemInventoryGroup.js
const mappingTable = require('../../mappingTable.json');

const transformItemInventoryGroup = (tipValue) => {
    return mappingTable[tipValue] || "00000";
};

const parseItemInventoryGroupTag = (xmlData) => {
    const tipValue = findTag(xmlData, 'TIP') || "00000"; // Используем findTag для получения значения тега TIP
    const transformedValue = transformItemInventoryGroup(tipValue);

    return {
        id: transformedValue,
        key: transformedValue,
        objectName: "ItemInventoryGroup"
    };
};

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

module.exports = {
    transformItemInventoryGroup,
    parseItemInventoryGroupTag
};
