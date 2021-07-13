import { GL_CODE, SUB_GL_CODE } from "../../constants";

// TODO: Add user alerts to this
export const isChartOfAccountWorkBookDataValid = (data) => {
  if (!("sheets" in data)) {
    console.log("Sheets key not in data");
    return false;
  }
  if (data.sheets.length === 0) {
    console.log("There are no sheets");
    return false;
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
      console.log("No segmentId or description columns in sheet", sheet);
      return false;
    }

    for (const row of sheet.columns) {
      // Each sheet needs at least 1 row
      if (row.length === 0) {
        console.log("No rows in the sheet", sheet);
        return false;
      }
    }
  }
  // If the data doesn't have a GLSheet OR SubGLSheet
  if (!hasGLSheet || !hasSubGLSheet) {
    console.log("the data doesn't have a GLSheet OR SubGLSheet");
    return false;
  }
  return true;
};
