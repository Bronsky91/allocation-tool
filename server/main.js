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
      throw new Meteor.Error("Not authorized.");
    }

    SegmentsCollection.insert({
      description,
      subSegments,
      chartFieldOrder,
      userId: this.userId,
      createdAt: new Date(),
    });
  },
  removeAllSegments: function ({}) {
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    SegmentsCollection.remove({});
  },
  insertMetric: function ({
    description,
    columns,
    validMethods,
    metricSegments,
  }) {
    // column = {
    //   title: "",
    //   rows: [{ value: "", rowNumber: 0 }],
    // };
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
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
  insertAllocation: function ({ name, subSegments, method, metricId }) {
    // subSegments = [{segmentName: "Department", subSegmentIds: ['010', '020', ...]}]
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    const newAllocationId = AllocationsCollection.insert({
      // TODO: Need to add metric (or parent method)
      name,
      subSegments,
      method,
      metricId,
      userId: this.userId,
      createdAt: new Date(),
    });
    return newAllocationId;
  },
  updateAllocation: function ({ id, name, subSegments, method }) {
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    AllocationsCollection.update(id, {
      $set: { name, subSegments, method },
    });
  },
  removeAllocation: function ({ id }) {
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    AllocationsCollection.remove(id);
  },
  calculateAllocation: function ({
    subSegments,
    method,
    toBalanceValue,
    userId,
    metricId,
  }) {
    return calcAllocation({
      subSegments,
      method,
      toBalanceValue,
      userId,
      metricId,
    });
  },
});

const SEED_USERNAME = "bronsky";
const SEED_PASSWORD = "password";

const SECOND_SEED_USERNAME = "nate";
const SECOND_SEE_PASSWORD = "password";

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
