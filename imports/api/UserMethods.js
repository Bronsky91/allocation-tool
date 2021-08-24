import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

// Deny all client-side updates to user documents
Meteor.users.deny({
  update() {
    return true;
  },
});

Meteor.methods({
  "user.create": function (data) {
    Accounts.createUser({
      username: data.username,
      password: data.email,
      name: data.name,
      email: data.email,
      redskyAdmin: false,
      admin: false,
    });
  },
  "user.admin": function (data) {
    // Only redsky admins can adjust admin privileges
    if (!this.userId || !Meteor.user()?.redskyAdmin) {
      throw new Meteor.Error("Not authorized.");
    }
    Meteor.users.update(
      { _id: data.id },
      {
        $set: {
          admin: data.admin,
        },
      }
    );
  },
  "user.redskyAdmin": function (data) {
    // Only other admins can adjust admin privileges
    if (!this.userId || !Meteor.user()?.redskyAdmin) {
      throw new Meteor.Error("Not authorized.");
    }
    if (this.userId === data.id) {
      throw new Meteor.Error("Cannot remove admin privileges from yourself");
    }
    Meteor.users.update(
      { _id: data.id },
      {
        $set: {
          redskyAdmin: data.admin,
        },
      }
    );
  },
});
