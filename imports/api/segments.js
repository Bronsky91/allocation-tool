import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { CHART_OF_ACCOUNT_COLUMNS } from "../../constants";

export const SegmentsCollection = new Mongo.Collection("segments");

export const CreateSegments = (data) => {
  for (const [index, sheet] of data.sheets.entries()) {
    const description = sheet.name;
    const chartFieldOrder = index;
    const subSegments = sheet.rows
      .filter((row) => row.length > 1)
      .map((row) => {
        const subSegment = {};
        row.map((r, i) => {
          subSegment[CHART_OF_ACCOUNT_COLUMNS[i]] = r.value;
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
