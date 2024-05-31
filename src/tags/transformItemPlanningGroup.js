// src/tags/transformItemPlanningGroup.js
const mappingTable = {
    "Деталь": 106614,
    "Финальная сборка": 77094,
    "Узловая сборка": 77095,
    "Сборка": 77096,
    "Комплект": 77097,
    "ПКИ": 77098,
    "Материал": 77099,
    "Нормаль": 77100,
    "Всп. материал": 77101,
    "Заготовка": 77102,
    "Проект": 77103,
    "Оснастка": 77104,
    "Инструмент": 77105,
    "ea": 78068,
    "RELEASED": 77733,
    "OBSOLETE": 77799
};

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
