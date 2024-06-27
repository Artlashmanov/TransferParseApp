// src/generateXML.js

const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const { logError, logInfo } = require('./utils/logger');

// Импорт необходимых функций
const { findTag, parsePartTag } = require('./tags/part');
const { parseItemPlanningGroupTag } = require('./tags/transformItemPlanningGroup');
const { parseItemInventoryGroupTag } = require('./tags/transformItemInventoryGroup');

const defaultNumber = "00000";

const getValueOrDefault = (data, defaultValue = defaultNumber) => {
    return data !== undefined ? data : defaultValue;
};

const generateXML = (data, templatePath, outputPath) => {
    if (!fs.existsSync(templatePath)) {
        logError(`Template file not found: ${templatePath}`);
        return;
    }

    fs.readFile(templatePath, (err, templateData) => {
        if (err) {
            logError(`Failed to read template file: ${err}`);
            return;
        }

        xml2js.parseString(templateData, (err, template) => {
            if (err) {
                logError(`Failed to parse template XML: ${err}`);
                return;
            }

            try {
                logInfo(`Template data: ${JSON.stringify(template)}`);

                const root = data.root || data.COLLECTION || {};
                const partData = parsePartTag(root);
                const itemPlanningGroupData = parseItemPlanningGroupTag(root);
                const itemInventoryGroupData = parseItemInventoryGroupTag(root);
                const primaryObjectID = findTag(root, 'PrimaryObjectID');
                const transactionNumber = findTag(root, 'TransactionNumber');

                const itemTemplate = template.root.item[0];

                itemTemplate.$.name = partData.name;
                itemTemplate.$.description = partData.description;

                itemTemplate.um[0].$ = partData.um;
                itemTemplate.itemtype[0].$ = partData.itemtype;
                itemTemplate.status[0].$ = partData.status;

                itemTemplate.itemplanninggroup[0].$ = itemPlanningGroupData;
                itemTemplate.iteminventorygroup[0].$ = itemInventoryGroupData;

                const taskId = getValueOrDefault(transactionNumber);
                template.root.$.taskId = taskId;

                const builder = new xml2js.Builder();
                const xml = builder.buildObject(template);

                const paddedTaskId = taskId.padStart(10, '0');
                const outputFileName = `${paddedTaskId}_Item.xml`;
                const outputFilePath = path.join(path.dirname(outputPath), outputFileName);

                fs.writeFile(outputFilePath, xml, (err) => {
                    if (err) {
                        logError(`Failed to save XML file: ${err}`);
                        return;
                    }
                    logInfo(`XML file has been saved as ${outputFileName}`);
                });
            } catch (err) {
                logError(`Error generating XML: ${err}`);
            }
        });
    });
};

module.exports = generateXML;
