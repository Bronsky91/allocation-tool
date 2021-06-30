import { Workbook } from "exceljs";

export const ReadWorkbook = (file) => {
  return getWorkbookData(file)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log("Error", err);
    });
};

const getWorkbookData = async (file) => {
  const excelData = {
    sheets: [],
  };

  // TODO: Accept csv or xlsx
  const workbook = new Workbook();
  await workbook.xlsx.load(file);
  workbook.eachSheet((worksheet, sheetId) => {
    const rows = [];
    const columns = [];
    worksheet.eachRow((row, rowNumber) => {
      const rowValues = row.values
        .filter((r) => r !== null)
        .map((r) => {
          if (r.result) {
            return { rowNumber, value: r.result };
          }
          return { rowNumber, value: r };
        });
      if (rowNumber === 1) {
        // Set columns
        columns.push(...rowValues.map((r) => r.value));
      } else {
        // Set rows
        rows.push(rowValues);
      }
    });
    // Add Sheet Data
    excelData.sheets = [
      ...excelData.sheets,
      {
        name: worksheet.name,
        id: sheetId,
        columns,
        rows,
      },
    ];
  });

  return excelData;
};


