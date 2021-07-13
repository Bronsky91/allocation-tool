import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { reconciliationAdjustments } from "./ReconciliationAdjustments";
import { convertDecimalToFixedFloat } from "./ConvertDecimalToFixedFloat";
import {
  createAllocationAccountString,
  createBalanceAccountString,
} from "./CreateAccountStrings";

export const CreateWorkbook = (data) => {
  workbookBuilder(data)
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

const workbookBuilder = (data) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(data.journalDescription);

  const reconciledData = reconciliationAdjustments(data);

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
      account: createAllocationAccountString(reconciledData, chartField),
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
    }
  }

  // Final Balancing Row
  const row = worksheet.addRow({
    account: createBalanceAccountString(reconciledData),
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

  if (reconciledData.allocationValueOfBalancePerChartField.sum.reconciled) {
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
      `Notation: ${Math.abs(reconciledData.difference).toFixed(2)} was ${
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
