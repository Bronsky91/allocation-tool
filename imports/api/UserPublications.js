import { Meteor } from "meteor/meteor";

Meteor.publish("userListRedsky", function () {
  if (Meteor.user()?.redskyAdmin) {
    return Meteor.users.find({});
  }
});

Meteor.publish("userList", function () {
  if (Meteor.user()?.admin) {
    return Meteor.users.find({ adminId: this.userId });
  }
});

Meteor.publish("Meteor.user.admin", function () {
  // Only show if the user is an admin or not
  const options = {
    fields: { redskyAdmin: 1, admin: 1, hasAdmin: 1 },
  };
  return Meteor.users.find({ _id: this.userId }, options);
});

Meteor.publish("Meteor.user.details", function () {
  // Shows the name and permissions for main page
  const options = {
    fields: { name: 1, permissions: 1, emails: 1 },
  };
  return Meteor.users.find({ _id: this.userId }, options);
});
