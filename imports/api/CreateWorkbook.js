import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { Decimal } from "decimal.js";
import { reconciliationAdjustments } from "./utils/ReconciliationAdjustments";
import { convertDecimalToFixedFloat } from "./utils/ConvertDecimalToFixedFloat";

export const CreateWorkbook = (data, segments) => {
  workbookBuilder(data, segments)
    .then((buffer) => {
      saveAs(
        new Blob([buffer]),
        `${data.journalDescription}_journal_entry.xlsx`
      );
    })
    .catch((err) => {
      console.log("Error", err);
    });
};

const workbookBuilder = (data, segments) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(data.journalDescription);

  const reconciledData = reconciliationAdjustments(data);
  console.log("reconciledData", reconciledData);

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
    typicalBalance === row ? convertDecimalToFixedFloat(amount.value) : 0;
  const getBalanceByTypicalBalance = (typicalBalance, amount, row) =>
    typicalBalance !== row ? convertDecimalToFixedFloat(amount.value) : 0;

  // Loop through Allocation Rows
  for (const chartField in reconciledData.allocationValueOfBalancePerChartField) {
    // Skip Sum Field
    if (chartField === "sum") {
      continue;
    }
    // Amount for each row
    const amount =
      reconciledData.allocationValueOfBalancePerChartField[chartField];
    // Row Object
    const rowObject = {
      // TODO: Find a way to do this dynamically based on ChartFieldOrder
      account: `${chartField}-${reconciledData.selectedAllocationSegment.segmentId}-${reconciledData.subGLSegment.segmentId}`,
      description: `${reconciledData.journalDescription}`,
      debit: getAmountByTypicalBalance(
        reconciledData.typicalBalance,
        amount,
        "debit"
      ),
      credit: getAmountByTypicalBalance(
        reconciledData.typicalBalance,
        amount,
        "credit"
      ),
    };
    // Adds row to worksheet
    const row = worksheet.addRow(rowObject);
    if (amount.reconciled) {
      const cellNumber = reconciledData.typicalBalance === "debit" ? 3 : 4;
      const cell = row.getCell(cellNumber);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" },
      };
      console.log(cell);
    }
  }

  // Final Row
  const row = worksheet.addRow({
    // TODO: Find a way to do this dynamically based on ChartFieldOrder
    account: `000-000-${reconciledData.selectedAllocationSegment.segmentId}-${reconciledData.subGLSegment.segmentId}`,
    description: `${reconciledData.journalDescription}`,
    debit: getBalanceByTypicalBalance(
      reconciledData.typicalBalance,
      reconciledData.allocationValueOfBalancePerChartField.sum,
      "debit"
    ),
    credit: getBalanceByTypicalBalance(
      reconciledData.typicalBalance,
      reconciledData.allocationValueOfBalancePerChartField.sum,
      "credit"
    ),
  });

  if (reconciledData.reconciled) {
    const cellNumber = reconciledData.typicalBalance === "debit" ? 4 : 3;
    const cell = row.getCell(cellNumber);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFF00" },
    };

    // TODO: TEMP FORMATTING FOR PROTOTYPING
    const rowIndex =
      Object.keys(reconciledData.allocationValueOfBalancePerChartField).length +
      4;
    const notationRow = worksheet.getRow(rowIndex);
    notationRow.values = [
      `Notation: ${reconciledData.difference.toFixed(2)} was ${
        Math.sign(reconciledData.difference) > 0 ? "added to" : "removed from"
      } highlighted account amount to balance`,
    ];
    notationRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFF00" },
    };
  }

  // save csv
  return workbook.xlsx.writeBuffer();
};
