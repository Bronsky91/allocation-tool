import { Meteor } from "meteor/meteor";
import { ChartOfAccountsCollection } from "../db/ChartOfAccountsCollection";

Meteor.publish("chartOfAccounts", function publishChartOfAccounts() {
  // A user is logged in
  if (Meteor.user()) {
    // The user is an admin and they have access to all of their chartOfAccounts
    if (Meteor.user().admin) {
      return ChartOfAccountsCollection.find({ userId: this.userId });
    }
    // The user has the permissions array and uses their adminId along with their permissions
    if (Meteor.user().permissions) {
      return ChartOfAccountsCollection.find({
        $and: [
          { userId: { $eq: Meteor.user().adminId } },
          { _id: { $in: Meteor.user().permissions.chartOfAccounts } },
        ],
      });
    }
  }
});
