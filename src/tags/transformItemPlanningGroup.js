// src/tags/transformItemPlanningGroup.js
const mappingTable = require('../../mappingTable.json');

const transformItemPlanningGroup = (tipValue) => {
    return mappingTable[tipValue] || "00000";
};

const parseItemPlanningGroupTag = (xmlData) => {
    const tipValue = findTag(xmlData, 'TIP') || "00000"; // Используем findTag для получения значения тега TIP
    const transformedValue = transformItemPlanningGroup(tipValue);

    return {
        id: transformedValue,
        key: transformedValue,
        objectName: "ItemPlanningGroup"
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
    transformItemPlanningGroup,
    parseItemPlanningGroupTag
};
