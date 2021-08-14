import { Meteor } from "meteor/meteor";
import { TemplateCollection } from "../db/TemplateCollection";

Meteor.publish("templates", function publishTemplates() {
  return TemplateCollection.find({ userId: this.userId });
});
