import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const AllocationsCollection = new Mongo.Collection("allocations");
