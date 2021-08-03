import { Meteor } from "meteor/meteor";
import { AllocationsCollection } from "../db/AllocationsColllection";

Meteor.publish("allocations", function publishAllocations() {
  return AllocationsCollection.find({ userId: this.userId });
});
