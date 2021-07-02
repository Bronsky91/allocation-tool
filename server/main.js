import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
// API
import { AllocationsCollection } from "../imports/api/Allocations";
import { MetricsCollection } from "../imports/api/Metrics";
import { SegmentsCollection } from "/imports/api/Segments";
// Utils
import { calcAllocation } from "./CalcAllocation";

// Arrow functions aren't going to work with these Methods while using this.userId
Meteor.methods({
  insertSegment: function ({ description, subSegments, chartFieldOrder }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    SegmentsCollection.insert({
      description,
      subSegments,
      chartFieldOrder,
      userId: this.userId,
      createdAt: new Date(),
    });
  },
  removeAllSegments: function ({ }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }
    SegmentsCollection.remove({});
  },
  insertMetric: function ({ description, columns, validMethods, metricSegments }) {
    // column = {
    //   title: "",
    //   rows: [{ value: "", rowNumber: 0 }],
    // };
    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }
    MetricsCollection.insert({
      description,
      columns,
      validMethods,
      metricSegments,
      userId: this.userId,
      createdAt: new Date(),
    });
  },
  insertAllocation: function ({ name, subSegments, metric }) {
    // subSegments = [{segmentName: "Department", subSegmentIds: ['010', '020', ...]}]
    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }
    const newAllocationId = AllocationsCollection.insert({
      // TODO: Need to add metric (or parent metric)
      name,
      subSegments,
      metric, // TODO: Need to rename this to method (or something other than metric)
      userId: this.userId,
      createdAt: new Date(),
    });
    return newAllocationId;
  },
  updateAllocation: function ({ id, name, subSegments, metric }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }
    AllocationsCollection.update(id, {
      $set: { name, subSegments, metric },
    });
  },
  removeAllocation: function ({ id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }
    AllocationsCollection.remove(id);
  },
  calculateAllocation: function ({ subSegments, metric, toBalanceValue, userId, parentMetricId }) {
    return calcAllocation({
      subSegments,
      metric,
      toBalanceValue,
      userId,
      parentMetricId
    });
  },
});

const SEED_USERNAME = "bronsky";
const SEED_PASSWORD = "password";

const SECOND_SEED_USERNAME = "nate"
const SECOND_SEE_PASSWORD = "password"

Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
    Accounts.createUser({
      username: SECOND_SEED_USERNAME,
      password: SECOND_SEE_PASSWORD,
    });
  }
});
