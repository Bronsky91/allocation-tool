import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const AllocationsCollection = new Mongo.Collection("allocations");

export const CreateAllocation = ({ name, subSegments, metric }) => {
  // Transform data into the 3 parts of an allocation
  Meteor.call("insertAllocation", { name, subSegments, metric }, (err, res) => {
    if (err) {
      console.log("err", err);
    } else {
      console.log("res", res);
    }
  });
};
