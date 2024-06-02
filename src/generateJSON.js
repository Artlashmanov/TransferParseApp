// src/generateJSON.js

const fs = require('fs');
const path = require('path');
const { parsePrimaryObjectID } = require('./parsePrimaryObjectID');
const { findTag, parsePartTag } = require('./tags/part');

const defaultNumber = "00000";

const getValueOrDefault = (data, defaultValue = defaultNumber) => {
    return data !== undefined && data !== "" ? data : defaultValue;
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
            const partData = parsePartTag(root, mapping);
            const primaryObjectID = findTag(root, 'PrimaryObjectID');
            const transactionNumber = findTag(root, 'TransactionNumber');

            const itemTemplate = template.data[0];

            itemTemplate.name = partData.name;
            itemTemplate.description = partData.description;

            itemTemplate.um = partData.um;
            itemTemplate.itemtype = partData.itemtype;
            itemTemplate.status = partData.status;

            const taskId = getValueOrDefault(transactionNumber);
            template.taskId = taskId;

            const jsonData = JSON.stringify(template, null, 2);

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
