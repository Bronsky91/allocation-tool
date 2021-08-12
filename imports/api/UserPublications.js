import { Meteor } from "meteor/meteor";

Meteor.publish("userList", function () {
  console.log("user publication", Meteor.user());
  if (Meteor.user().redskyAdmin) {
    return Meteor.users.find({});
  }
});

Meteor.publish("Meteor.user.redskyAdmin", function () {
  // Select only the users that match the array of IDs passed in
  console.log("hello from pub");

  // Only return one field, `redskyAdmin`
  const options = {
    fields: { redskyAdmin: 1 },
  };

  return Meteor.users.find({}, options);
});
