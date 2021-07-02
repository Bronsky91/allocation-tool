import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
// API
import { AllocationsCollection } from "../imports/api/Allocations";
import { MetricsCollection } from "../imports/api/Metrics";
import { SegmentsCollection } from "/imports/api/Segments";
// Utils
import { calcAllocation } from "./CalcAllocation";

Meteor.methods({
  insertSegment: ({ description, subSegments, chartFieldOrder }) => {
    SegmentsCollection.insert({
      description,
      subSegments,
      chartFieldOrder,
      createdAt: new Date(),
    });
  },
  removeAllSegments: ({}) => {
    SegmentsCollection.remove({});
  },
  insertMetric: ({ description, columns, validMethods, metricSegments }) => {
    // column = {
    //   title: "",
    //   rows: [{ value: "", rowNumber: 0 }],
    // };
    MetricsCollection.insert({
      description,
      columns,
      validMethods,
      metricSegments,
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

const SEED_USERNAME = "bronsky";
const SEED_PASSWORD = "password";

Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }
});
