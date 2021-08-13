import { Meteor } from "meteor/meteor";

Meteor.publish("userList", function () {
  console.log("userList publication", Meteor.user());
  if (Meteor.user().redskyAdmin) {
    return Meteor.users.find({});
  }
});

Meteor.publish("Meteor.user.redskyAdmin", function () {
  // Only return one field, `redskyAdmin`
  const options = {
    fields: { redskyAdmin: 1 },
  };

  return Meteor.users.find({}, options);
});
