import { Mongo } from "meteor/mongo";

export const ChartOfAccountsCollection = new Mongo.Collection(
  "chartOfAccounts"
);
