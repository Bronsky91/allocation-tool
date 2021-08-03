import { Meteor } from "meteor/meteor";
import { MetricsCollection } from "../db/MetricsCollection";

Meteor.publish("metrics", function publishMetrics() {
  return MetricsCollection.find({ userId: this.userId });
});
