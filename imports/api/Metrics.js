import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const MetricsCollection = new Mongo.Collection("metrics");

export const CreateMetrics = (data) => {
  for (const sheet of data.sheets) {
    const description = sheet.name;
    const columnNames = sheet.columns;
    // TODO: Create a different metric object for documents that are for after onboarding
    // TODO: This data should be used during the metric selection process and not for actually saving the metrics yet
    const columns = columnNames.map((cn, index) => {
      // column = {
      //   title: "",
      //   rows: [{ value: "", rowNumber: 0 }],
      // };
      return {
        title: cn,
        rows: sheet.rows.map((row) => {
          return row[index];
        }),
      };
    });

    Meteor.call("insertMetric", { description, columns }, (err, res) => {
      if (err) {
        console.log("err", err);
      } else {
        console.log("res", res);
      }
    });
  }
};
