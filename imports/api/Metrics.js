import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const MetricsCollection = new Mongo.Collection("metrics");

export const CreateMetric = (data) => {
  // validMethods - Array of column names that are used for allocation
  // metricSegments - Array of column names that are linked to Segments
  const description = data.name;
  const columnNames = data.columns;
  const validMethods = data.validMethods;
  const metricSegments = data.metricSegments;
  const columns = columnNames.map((cn, index) => {
    // column = {
    //   title: "",
    //   rows: [{ value: "", rowNumber: 0 }],
    // };
    return {
      title: cn,
      rows: data.rows.map((row) => {
        return row[index];
      }),
    };
  });

  Meteor.call(
    "insertMetric",
    { description, columns, validMethods, metricSegments },
    (err, res) => {
      if (err) {
        console.log("err", err);
      } else {
        console.log("res", res);
      }
    }
  );
};
