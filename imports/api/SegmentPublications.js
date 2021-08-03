import { Meteor } from "meteor/meteor";
import { SegmentsCollection } from "../db/SegmentsCollection";

Meteor.publish("segments", function publishSegments() {
  return SegmentsCollection.find({ userId: this.userId });
});
