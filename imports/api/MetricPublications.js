import { Meteor } from "meteor/meteor";
import { MetricsCollection } from "../db/MetricsCollection";

Meteor.publish("metrics", function publishMetrics() {
  return MetricsCollection.find({ userId: this.userId });
});

// user = {
//   userId: "",
//   name: "mary",
//   admin: false,
//   adminId: "denna42069", // user admin's ID
//   permissions: {
//     chartOfAccounts: ["coa_id", "2coa_id"],
//     metrics: ["metricId", "metricId", "metricId", "metricId"],
//     allocations: []
//   },
// };

// chartOfAccounts = {
//   name: "",
//   userId: "", // Client Admin's User ID
//   segments: [],
//   templates: [],
//   metrics = [
//     {
//       // ....
//       allocations: [],
//     },
//   ],
// };

// const user = Meteor.user(); // mary's user account
// const allChartOfAccounts = chartOfAccountsCollection.find({
//   userId: user.adminId,
// });
// const availableChartOfAccounts = allChartOfAccounts.filter((coa) =>
//   user.permission.chartOfAccounts.includes(coa._id)
// );

// const availableMetrics = allChartOfAccounts.metrics.filter((metric) =>
//   user.permission.metrics.includes(metric))
