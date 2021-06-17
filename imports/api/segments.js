import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

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
          subSegment[COLUMNS[i]] = r;
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

export const COLUMNS = {
  0: "segmentId",
  1: "description",
  2: "category",
};
