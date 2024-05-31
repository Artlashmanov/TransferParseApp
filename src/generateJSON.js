const fs = require('fs');
const path = require('path');
const transformValue = require('./transformValue');
const parsePrimaryObjectID = require('./parsePrimaryObjectID');
const transformDefineOfSetupYield = require('./transformDefineOfSetupYield');
const transformDefineOfTestYield = require('./transformDefineOfTestYield');
const transformItemInventoryGroup = require('./transformItemInventoryGroup');
const transformItemPlanningGroup = require('./transformItemPlanningGroup');
const transformTaskId = require('./transformTaskId');

const defaultNumber = "00000";

const getValueOrDefault = (data, defaultValue = defaultNumber) => {
    return data !== undefined && data !== "" ? data : defaultValue;
};

const extractValue = (obj, key) => {
    return obj && obj[key] && obj[key][0] ? obj[key][0] : defaultNumber;
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

const generateJSON = (data, templatePath, outputPath, mapping) => {
    fs.readFile(templatePath, (err, templateData) => {
        if (err) {
            console.error('Failed to read template file:', err);
            return;
        }

        try {
            const template = JSON.parse(templateData);

            const root = data.COLLECTION || {};
            const part = root.ChangedParts && root.ChangedParts[0] && root.ChangedParts[0].Part ? root.ChangedParts[0].Part[0] : {};
            const primaryObjectID = findTag(root, 'PrimaryObjectID');
            const transactionNumber = findTag(root, 'TransactionNumber');

            console.log('Parsed PrimaryObjectID:', primaryObjectID);
            console.log('Parsed TransactionNumber:', transactionNumber);

            const defaultUnitValue = findTag(part, 'DefaultUnit') || defaultNumber;
            const tipValue = findTag(part, 'TIP') || defaultNumber;
            const nameValue = findTag(part, 'Name') || defaultNumber;
            const stateValue = findTag(part, 'State') || defaultNumber;
            const numberValue = findTag(part, 'Number') || defaultNumber;

            const itemTemplate = template.data[0];

            if (primaryObjectID) {
                const parsedPrimaryObjectID = parsePrimaryObjectID(primaryObjectID);
                console.log('Parsed PrimaryObjectID data:', parsedPrimaryObjectID);

                // Заполнение полей на основе PrimaryObjectID
                itemTemplate.defineOfSetupYield = parsedPrimaryObjectID.defineOfSetupYield;
                itemTemplate.defineOfTestYield = parsedPrimaryObjectID.defineOfTestYield;
                itemTemplate.key = parsedPrimaryObjectID.key;
            } else {
                console.log('PrimaryObjectID not found');
            }

            // Заполнение атрибутов объекта um
            itemTemplate.um = {
                id: getValueOrDefault(transformValue(defaultUnitValue, mapping)),
                key: getValueOrDefault(transformValue(defaultUnitValue, mapping)),
                objectName: "UnitMeasure"
            };

            // Заполнение атрибутов объекта itemtype
            itemTemplate.itemtype = {
                id: getValueOrDefault(transformValue(tipValue, mapping)),
                key: getValueOrDefault(transformValue(tipValue, mapping)),
                objectName: "ItemType"
            };

            // Заполнение атрибута name объекта item из Number
            itemTemplate.name = getValueOrDefault(transformValue(numberValue));

            // Заполнение атрибута description объекта item из Name
            itemTemplate.description = getValueOrDefault(transformValue(nameValue));

            // Заполнение атрибутов объекта status
            itemTemplate.status = {
                id: getValueOrDefault(transformValue(stateValue, mapping)),
                key: getValueOrDefault(transformValue(stateValue, mapping)),
                objectName: "Status"
            };

            // Заполнение атрибутов для других объектов
            itemTemplate.itemplanninggroup = {
                id: transformItemPlanningGroup(tipValue),
                key: transformItemPlanningGroup(tipValue),
                objectName: "ItemPlanningGroup"
            };
            itemTemplate.iteminventorygroup = {
                id: transformItemInventoryGroup(tipValue),
                key: transformItemInventoryGroup(tipValue),
                objectName: "ItemInventoryGroup"
            };

            itemTemplate.id = getValueOrDefault(numberValue);
            itemTemplate.code = getValueOrDefault(numberValue);

            // Заполнение поля taskId из тега TransactionNumber
            const taskId = getValueOrDefault(transactionNumber);
            template.taskId = taskId;

            const jsonData = JSON.stringify(template, null, 2);

            // Создание имени файла на основе taskId
            const paddedTaskId = taskId.padStart(10, '0');
            const outputFileName = `${paddedTaskId}_Item.json`;
            const outputFilePath = path.join(path.dirname(outputPath), outputFileName);

            fs.writeFile(outputFilePath, jsonData, (err) => {
                if (err) {
                    console.error('Failed to save JSON file:', err);
                    return;
                }
                console.log(`JSON file has been saved as ${outputFileName}`);
            });
        } catch (err) {
            console.error('Error generating JSON:', err);
        }
    });
};

module.exports = generateJSON;
