import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
// db
import { TemplateCollection } from "../db/TemplateCollection";

Meteor.methods({
  "template.insert": function (data) {
    // check(data, {
    //   columns: [String],
    //   id: Number,
    //   name: String,
    //   metricSegments: [String], // metricSegments - Array of column names that are linked to Segments
    //   validMethods: [String], // validMethods - Array of column names that are used for allocation
    //   rows: [[{ rowNumber: Number, value: Match.OneOf(String, Number) }]],
    // });

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    // TemplateCollection.insert({
    //   description,
    //   columns,
    //   validMethods,
    //   metricSegments,
    //   userId: this.userId,
    //   createdAt: new Date(),
    // });
  },
});
