const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const readExcelFile = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
};

const writeExcelFile = (data, templatePath, outputFilePath) => {
    const templateWorkbook = xlsx.readFile(templatePath);
    const templateSheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]];
    const newSheet = xlsx.utils.json_to_sheet(data);

    // Здесь добавим логику применения шаблона
    // Пока просто перезаписываем новый лист
    templateWorkbook.Sheets[templateWorkbook.SheetNames[0]] = newSheet;

    xlsx.writeFile(templateWorkbook, outputFilePath);
};

module.exports = {
    readExcelFile,
    writeExcelFile
};
