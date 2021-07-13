import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
// db
import { SegmentsCollection } from "../db/SegmentsCollection";
// constants
import { CHART_OF_ACCOUNT_COLUMNS, VALID_COLUMN_NAMES } from "../../constants";

Meteor.methods({
  "segment.insert": function (workbookData) {
    check(workbookData, {
      sheets: [
        {
          columns: [String],
          id: Number,
          name: String,
          rows: [[{ rowNumber: Number, value: Match.OneOf(String, Number) }]],
        },
      ],
    });

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    for (const [index, sheet] of workbookData.sheets.entries()) {
      const description = sheet.name;
      const chartFieldOrder = index;
      // Columns object that matches the columns to it's index in the sheet to be inserted properly in the rows map
      const columnIndexRef = sheet.columns.reduce(
        (columnIndexRefObj, columnName, i) => {
          // If the column in the sheet is valid for processing, add it to the object
          if (VALID_COLUMN_NAMES.includes(columnName)) {
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

      SegmentsCollection.insert({
        description,
        subSegments,
        chartFieldOrder,
        userId: this.userId,
        createdAt: new Date(),
      });
    }
  },
  "segment.removeAll": function ({}) {
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    SegmentsCollection.remove({});
  },
});
