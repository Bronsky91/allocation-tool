import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const AllocationsCollection = new Mongo.Collection("allocations");

export const removeAllocation = (id) => {
  Meteor.call("removeAllocation", { id }, (err, res) => {
    if (err) {
      console.log("err", err);
    } else {
      console.log("res", res);
    }
  });
};
