import { Meteor } from "meteor/meteor";

Meteor.publish("userList", function () {
  if (Meteor.user()?.redskyAdmin) {
    return Meteor.users.find({});
  }
});

Meteor.publish("Meteor.user.admin", function () {
  // Only return one field, `redskyAdmin`
  const options = {
    fields: { redskyAdmin: 1, admin: 1 },
  };

  return Meteor.users.find({}, options);
});
