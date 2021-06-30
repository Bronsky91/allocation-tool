import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { CHART_OF_ACCOUNT_COLUMNS } from "../../constants";

export const SegmentsCollection = new Mongo.Collection("segments");

export const CreateSegments = (data) => {
  for (const [index, sheet] of data.sheets.entries()) {
    const validColumns = Object.keys(CHART_OF_ACCOUNT_COLUMNS);

    const description = sheet.name;
    const chartFieldOrder = index;
    // Columns object that matches the columns to it's index in the sheet to be inserted properly in the rows map
    const columnIndexRef = sheet.columns.reduce(
      (columnIndexRefObj, columnName, i) => {
        // If the column in the sheet is valid for processing, add it to the object
        if (validColumns.includes(columnName)) {
          return {
            ...columnIndexRefObj,
            [i]: CHART_OF_ACCOUNT_COLUMNS[columnName],
          };
        }
        // Otherwise return the object as-is and continue
        return columnIndexRefObj;
      },
      {}
    );

    const subSegments = sheet.rows
      .filter((row) => row.length > 1)
      .map((row) => {
        const subSegment = {};
        row.map((r, i) => {
          subSegment[columnIndexRef[i]] = r.value;
        });
        return subSegment;
      });

    Meteor.call(
      "insertSegment",
      { description, subSegments, chartFieldOrder },
      (err, res) => {
        if (err) {
          console.log("err", err);
        } else {
          console.log("res", res);
        }
      }
    );
  }
};
