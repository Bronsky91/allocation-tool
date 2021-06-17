import { Workbook } from "exceljs";

export const ReadWorkbook = (file) => {
  console.log("got file", file);
  return getWorkbookData(file)
    .then((res) => {
      console.log("excelData", res);
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
            return r.result;
          }
          return r;
        });
      if (rowNumber === 1) {
        // Set columns
        columns.push(...rowValues);
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
