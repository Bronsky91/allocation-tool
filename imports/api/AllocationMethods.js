import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
// db
import { AllocationsCollection } from "../db/AllocationsColllection";

Meteor.methods({
  "allocation.insert": function ({ name, subSegments, method, metricId }) {
    check(name, String);
    check(subSegments, [
      { segmentName: String, subSegmentIds: [Match.OneOf(String, Number)] },
    ]);
    check(method, String);
    check(metricId, String);

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    const newAllocationId = AllocationsCollection.insert({
      name,
      subSegments,
      method,
      metricId,
      userId: this.userId,
      createdAt: new Date(),
    });
    return newAllocationId;
  },
  "allocation.update": function ({ id, name, subSegments, method }) {
    check(id, String);
    check(name, String);
    check(subSegments, [
      { segmentName: String, subSegmentIds: [Match.OneOf(String, Number)] },
    ]);
    check(method, String);

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    AllocationsCollection.update(id, {
      $set: { name, subSegments, method },
    });
  },
  "allocation.remove": function ({ id }) {
    check(id, String);

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    AllocationsCollection.remove(id);
  },
  "allocation.removeAll": function ({}) {
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    AllocationsCollection.remove({ userId: this.userId });
  },
});
