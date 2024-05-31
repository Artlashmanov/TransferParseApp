const fs = require('fs');
const xml2js = require('xml2js');
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
    return data !== undefined ? data : defaultValue;
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

const transformAttributes = (source, target, attributeMapping) => {
    if (source && source.$) {
        for (const [sourceAttr, targetAttr] of Object.entries(attributeMapping)) {
            let value = source.$[sourceAttr];
            value = transformValue(value); // Преобразование значения
            target.$[targetAttr] = getValueOrDefault(value);
        }
    }
};

const replaceDefaultValues = (obj) => {
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            replaceDefaultValues(obj[key]);
        } else {
            if (obj[key] === "00000") {
                obj[key] = defaultNumber;
            }
        }
    }
};

const generateXML = (data, templatePath, outputPath, mapping) => {
    fs.readFile(templatePath, (err, templateData) => {
        if (err) {
            console.error('Failed to read template file:', err);
            return;
        }

        xml2js.parseString(templateData, (err, template) => {
            if (err) {
                console.error('Failed to parse template XML:', err);
                return;
            }

            try {
                replaceDefaultValues(template);

                const root = data.root || data.COLLECTION || {};
                const part = findTag(root, 'Part');
                const primaryObjectID = findTag(root, 'PrimaryObjectID');
                const transactionNumber = findTag(root, 'TransactionNumber');

                console.log('Parsed PrimaryObjectID:', primaryObjectID);
                console.log('Parsed Part:', part);
                console.log('Parsed TransactionNumber:', transactionNumber);

                const defaultUnitValue = findTag(part, 'DefaultUnit') || defaultNumber;
                const tipValue = findTag(part, 'TIP') || defaultNumber;
                const nameValue = findTag(part, 'Name') || defaultNumber;
                const stateValue = findTag(part, 'State') || defaultNumber;
                const numberValue = findTag(part, 'Number') || defaultNumber;

                console.log('DefaultUnit Value:', defaultUnitValue);
                console.log('TIP Value:', tipValue);
                console.log('Name Value:', nameValue);
                console.log('State Value:', stateValue);
                console.log('Number Value:', numberValue);

                const parsedPrimaryObjectID = parsePrimaryObjectID(primaryObjectID);

                const itemTemplate = template.root.item[0];

                // Применение таблицы соответствия к атрибутам Part
                if (mapping.attributes.Part && part) {
                    transformAttributes(part, itemTemplate, mapping.attributes.Part);
                }

                // Заполнение атрибутов тега um
                itemTemplate.um[0].$ = {
                    id: getValueOrDefault(transformValue(defaultUnitValue, mapping)),
                    key: getValueOrDefault(transformValue(defaultUnitValue, mapping)),
                    objectName: "UnitMeasure"
                };

                // Заполнение атрибутов тега itemtype
                itemTemplate.itemtype[0].$ = {
                    id: getValueOrDefault(transformValue(tipValue, mapping)),
                    key: getValueOrDefault(transformValue(tipValue, mapping)),
                    objectName: "ItemType"
                };

                // Заполнение атрибута name тега item из Number
                itemTemplate.$.name = getValueOrDefault(transformValue(numberValue));

                // Заполнение атрибута description тега item из Name
                itemTemplate.$.description = getValueOrDefault(transformValue(nameValue));

                // Заполнение атрибутов тега status
                itemTemplate.status[0].$ = {
                    id: getValueOrDefault(transformValue(stateValue, mapping)),
                    key: getValueOrDefault(transformValue(stateValue, mapping)),
                    objectName: "Status"
                };

                // Заполнение атрибутов для тегов itemplanninggroup и iteminventorygroup
                itemTemplate.itemplanninggroup[0].$ = {
                    id: transformItemPlanningGroup(tipValue),
                    key: transformItemPlanningGroup(tipValue),
                    objectName: "ItemPlanningGroup"
                };
                itemTemplate.iteminventorygroup[0].$ = {
                    id: transformItemInventoryGroup(tipValue),
                    key: transformItemInventoryGroup(tipValue),
                    objectName: "ItemInventoryGroup"
                };

                // Заполнение полей на основе PrimaryObjectID
                itemTemplate.$.defineOfSetupYield = parsedPrimaryObjectID.defineOfSetupYield;
                itemTemplate.$.defineOfTestYield = parsedPrimaryObjectID.defineOfTestYield;
                itemTemplate.$.key = parsedPrimaryObjectID.key;
                
                // Заполнение поля taskId из тега TransactionNumber
                const taskId = getValueOrDefault(transactionNumber);
                template.root.$.taskId = taskId;

                const builder = new xml2js.Builder();
                const xml = builder.buildObject(template);

                // Создание имени файла на основе taskId
                const paddedTaskId = taskId.padStart(10, '0');
                const outputFileName = `${paddedTaskId}_Item.xml`;
                const outputFilePath = path.join(path.dirname(outputPath), outputFileName);

                fs.writeFile(outputFilePath, xml, (err) => {
                    if (err) {
                        console.error('Failed to save XML file:', err);
                        return;
                    }
                    console.log(`XML file has been saved as ${outputFileName}`);
                });
            } catch (err) {
                console.error('Error generating XML:', err);
            }
        });
    });
};

module.exports = generateXML;
