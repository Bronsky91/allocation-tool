import { Meteor } from "meteor/meteor";
import { AllocationsCollection } from "../imports/api/Allocations";
import { MetricsCollection } from "../imports/api/Metrics";
import { SegmentsCollection } from "/imports/api/Segments";

Meteor.methods({
  insertSegment: ({ description, subSegments, chartFieldOrder }) => {
    SegmentsCollection.insert({
      description,
      subSegments,
      chartFieldOrder,
      createdAt: new Date(),
    });
  },
  insertMetric: ({ description, columns }) => {
    // column = {
    //   title: "",
    //   rows: [{ value: "", rowNumber: 0 }],
    // };
    MetricsCollection.insert({
      description,
      columns,
      createdAt: new Date(),
    });
  },
  insertAllocation: ({ segments, subSegments, metric }) => {
    AllocationsCollection.insert({
      segments,
      subSegments,
      metric,
      createdAt: new Date(),
    });
  },
});

Meteor.startup(() => {});
