import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { reconciliationAdjustments } from "./ReconciliationAdjustments";
import { convertDecimalToFixedFloat } from "./ConvertDecimalToFixedFloat";
import {
  createAllocationAccountString,
  createBalanceAccountString,
} from "./CreateAccountStrings";
import { CURRENCY_FORMAT } from "../../constants";

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

  // Journal Entry Header
  const headerRowCount = 6;
  const timestamp = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const entryDateFormatted = data.entryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  worksheet.getCell("A1").value = "JE Reference Description:";
  worksheet.getCell("B1").value = data.journalDescription;
  worksheet.getCell("A2").value = "Journal Entry Date:";
  worksheet.getCell("B2").value = entryDateFormatted;
  worksheet.getCell("A3").value = "Generated Date:";
  worksheet.getCell("B3").value = timestamp;
  worksheet.getCell("A4").value = "Author:";
  worksheet.getCell("B4").value = data.username;

  // Column Headers
  const headerRow = worksheet.getRow(headerRowCount + 1);
  headerRow.values = ["Account", "Description", "Debit", "Credit"];
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = { bottom: { style: "thin" } };
  });

  // Column keys
  worksheet.columns = [
    {
      key: "account",
      width: 22 < data.segments.length * 5 ? data.segments.length * 5 : 22,
    },
    {
      key: "description",
      width:
        data.journalDescription.length < timestamp.length
          ? timestamp.length
          : data.journalDescription.length,
    },
    {
      key: "debit",
      width:
        data.toBalanceSegmentValue.toString().length * 2 > 10
          ? data.toBalanceSegmentValue.toString().length * 2
          : 10,
    },
    {
      key: "credit",
      width:
        data.toBalanceSegmentValue.toString().length * 2 > 10
          ? data.toBalanceSegmentValue.toString().length * 2
          : 10,
    },
  ];

  // Apply currency format to debit and credit cells
  worksheet.getColumn(3).numFmt = CURRENCY_FORMAT;
  worksheet.getColumn(4).numFmt = CURRENCY_FORMAT;

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

    const rowIndex =
      Object.keys(reconciledData.allocationValueOfBalancePerChartField).length +
      headerRowCount +
      5;
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
    worksheet.mergeCells(rowIndex, 1, rowIndex, 4);
  }

  // save csv
  return workbook.xlsx.writeBuffer();
};
