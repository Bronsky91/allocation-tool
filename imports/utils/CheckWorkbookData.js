import { GL_CODE, SUB_GL_CODE } from "../../constants";

// TODO: Add user alerts to this
export const isChartOfAccountWorkBookDataValid = (data) => {
  const messageEnd = `Please check the file format.`;

  if (!("sheets" in data)) {
    return { err: "Could not find any excel sheets", valid: false };
  }
  if (data.sheets.length === 0) {
    return { err: "Could not find any excel sheets", valid: false };
  }

  let hasGLSheet = false;
  let hasSubGLSheet = false;
  for (const sheet of data.sheets) {
    // Data contains a GL_CODE sheet
    if (sheet.name === GL_CODE) {
      hasGLSheet = true;
    }
    // Data contains a SUB_GL_CODE sheet
    if (sheet.name === SUB_GL_CODE) {
      hasSubGLSheet = true;
    }
    let minValidColumnCount = 0;
    // Sheet has minimum valid column names
    for (const column of sheet.columns) {
      if (column === "Segment ID" || column === "Description") {
        minValidColumnCount++;
      }
    }
    // If the sheet doesn't have at least segment and description
    if (minValidColumnCount !== 2) {
      return {
        err: `No Segment ID and/or Description columns found in sheet ${sheet.name}. ${messageEnd}`,
        valid: false,
      };
    }

    for (const row of sheet.columns) {
      // Each sheet needs at least 1 row
      if (row.length === 0) {
        return {
          err: `No valid rows found in sheet ${sheet.name}. ${messageEnd}`,
          valid: false,
        };
      }
    }
  }
  // If the data doesn't have a GLSheet OR SubGLSheet
  if (!hasGLSheet || !hasSubGLSheet) {
    return {
      err: `The file doesn't have a GL_Code and/or Sub_GL_Code Sheet. ${messageEnd}`,
      valid: false,
    };
  }
  return { valid: true };
};
