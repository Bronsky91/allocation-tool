import { Meteor } from "meteor/meteor";
import { AllocationsCollection } from "../imports/api/Allocations";
import { MetricsCollection } from "../imports/api/Metrics";
import { calcAllocation } from "./CalcAllocation";
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
  insertAllocation: ({ name, subSegments, metric }) => {
    // subSegments = [{segmentName: "Department", subSegmentIds: ['010', '020', ...]}]
    const newAllocationId = AllocationsCollection.insert({
      name,
      subSegments,
      metric,
      createdAt: new Date(),
    });
    return newAllocationId;
  },
  updateAllocation: ({ id, name, subSegments, metric }) => {
    AllocationsCollection.update(id, {
      $set: { name, subSegments, metric },
    });
  },
  removeAllocation: ({ id }) => {
    AllocationsCollection.remove(id);
  },
  calculateAllocation: ({ subSegments, metric, toBalanceValue }) => {
    return calcAllocation({
      subSegments,
      metric,
      toBalanceValue,
    });
  },
});

Meteor.startup(() => {});
