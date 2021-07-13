import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
// db
import { MetricsCollection } from "../db/MetricsCollection";

Meteor.methods({
  "metric.insert": function (data) {
    check(data, {
      columns: [String],
      id: Number,
      name: String,
      metricSegments: [String], // metricSegments - Array of column names that are linked to Segments
      validMethods: [String], // validMethods - Array of column names that are used for allocation
      rows: [[{ rowNumber: Number, value: Match.OneOf(String, Number) }]],
    });

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    const description = data.name;
    const columnNames = data.columns;
    const validMethods = data.validMethods;
    const metricSegments = data.metricSegments;
    const columns = columnNames.map((cn, index) => ({
      title: cn,
      rows: data.rows.map((row) => {
        return row[index];
      }),
    }));

    MetricsCollection.insert({
      description,
      columns,
      validMethods,
      metricSegments,
      userId: this.userId,
      createdAt: new Date(),
    });
  },
});
