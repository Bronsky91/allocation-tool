import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const MetricsCollection = new Mongo.Collection("metrics");

export const CreateMetrics = (data) => {
  for (const sheet of data.sheets) {
    const description = sheet.name;
    const columnNames = sheet.columns;

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

    console.log("metric", {
      description,
      columns,
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
