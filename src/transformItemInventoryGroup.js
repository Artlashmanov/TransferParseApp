const mappingTable = {
    "Деталь": 106630,
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
    // Добавьте другие соответствия здесь
};

const transformItemInventoryGroup = (tipValue) => {
    return mappingTable[tipValue] || "00000";
};

module.exports = transformItemInventoryGroup;
