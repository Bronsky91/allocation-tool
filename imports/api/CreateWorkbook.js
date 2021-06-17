import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

export const CreateWorkbook = (data) => {
  workbookBuilder(data)
    .then((buffer) => {
      saveAs(new Blob([buffer]), `${data.journalHeader}_journal_entry.csv`);
    })
    .catch((err) => {
      console.log("Error", err);
    });
};

const workbookBuilder = (data) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(data.journalHeader);

  worksheet.columns = [
    {
      header: "Full Account Description",
      key: "fullAccountDescription",
      width: 32,
    },
    { header: "Full Account", key: "fullAccount", width: 15 },
    { header: "Debit", key: "debit", width: 15 },
    { header: "Credit", key: "credit", width: 15 },
  ];

  worksheet.getColumnKey;

  for (const row of data.allocationRows) {
    // Loop through Allocation Rows
    worksheet.addRow({
      fullAccountDescription: `${row.title} - ${data.expenseAccountDescription}`,
      fullAccount: `${row.costCenterSegment}-${data.expenseAccountNumber}-0000`,
      debit: 0, // No reference to Debit in the form yet
      credit: `$${row.amount}`,
    });
  }

  // Final Row
  worksheet.addRow({
    fullAccountDescription: data.balancingAccountTitle,
    fullAccount: `0-${data.balancingAccountNumber}-0000`,
    debit: data.allocationRows
      .map((row) => row.amount)
      .reduce((a, b) => a + b, 0), // Add all row amounts together
    credit: 0,
  });

  // save under export.xlsx
  return workbook.csv.writeBuffer();
};
