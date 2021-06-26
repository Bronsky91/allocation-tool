import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { CHART_OF_ACCOUNT_COLUMNS } from "../../constants";

export const AllocationsCollection = new Mongo.Collection("allocations");

export const CreateAllocations = (data) => {
  // Transform data into the 3 parts of an allocation
  Meteor.call(
    "insertAllocation",
    { segments, subSegments, metric },
    (err, res) => {
      if (err) {
        console.log("err", err);
      } else {
        console.log("res", res);
      }
    }
  );
};
