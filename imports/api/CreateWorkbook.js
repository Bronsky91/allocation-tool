import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { Decimal } from "decimal.js";

export const CreateWorkbook = (data, segments) => {
  workbookBuilder(data, segments)
    .then((buffer) => {
      saveAs(
        new Blob([buffer]),
        `${data.journalDescription}_journal_entry.csv`
      );
    })
    .catch((err) => {
      console.log("Error", err);
    });
};

const workbookBuilder = (data, segments) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(data.journalDescription);

  worksheet.columns = [
    {
      header: "Account",
      key: "account",
      width: 32,
    },
    { header: "Description", key: "description", width: 15 },
    { header: "Debit", key: "debit", width: 15 },
    { header: "Credit", key: "credit", width: 15 },
  ];

  const getAmountByTypicalBalance = (typicalBalance, amount, row) =>
    typicalBalance === row ? `$${amount.toFixed(2)}` : "$ - ";
  const getBalanceByTypicalBalance = (typicalBalance, amount, row) =>
    typicalBalance !== row ? `$${amount.toFixed(2)}` : "$ - ";

  const arrayOfAllocationValues = [];
  for (const chartField in data.allocationValueOfBalancePerChartField) {
    // Loop through Allocation Rows
    worksheet.addRow({
      // TODO: Find a way to do this dynamically based on ChartFieldOrder
      account: `${chartField}-${data.selectedAllocationSegment.segmentId}-${data.subGLSegment.segmentId}`,
      description: `${data.journalDescription}`,
      debit: getAmountByTypicalBalance(
        data.typicalBalance,
        data.allocationValueOfBalancePerChartField[chartField],
        "debit"
      ),
      credit: getAmountByTypicalBalance(
        data.typicalBalance,
        data.allocationValueOfBalancePerChartField[chartField],
        "credit"
      ),
    });
    arrayOfAllocationValues.push(
      new Decimal(data.allocationValueOfBalancePerChartField[chartField])
    );
  }
  // The final sum of the selected Metric
  const sumOfAllocationValues = arrayOfAllocationValues.reduce(
    (a, b) => a.plus(b),
    new Decimal(0)
  );
  // Final Row
  worksheet.addRow({
    // TODO: Find a way to do this dynamically based on ChartFieldOrder
    account: `000-000-${data.selectedAllocationSegment.segmentId}-${data.subGLSegment.segmentId}`,
    description: `${data.journalDescription}`,
    debit: getBalanceByTypicalBalance(
      data.typicalBalance,
      sumOfAllocationValues,
      "debit"
    ),
    credit: getBalanceByTypicalBalance(
      data.typicalBalance,
      sumOfAllocationValues,
      "credit"
    ),
  });

  // save under export.xlsx
  return workbook.csv.writeBuffer();
};
