import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

// Deny all client-side updates to user documents
Meteor.users.deny({
  update() {
    return true;
  },
});

Meteor.methods({
  "user.admin.create": function (data) {
    Accounts.createUser({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      redskyAdmin: false,
      admin: false,
    });
  },
  "user.admin.toggle": function (data) {
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
  "user.create": function (data) {
    // Only admins can create users
    if (!this.userId || !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }
    Accounts.createUser({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      redskyAdmin: false,
      admin: false,
      adminId: this.userId, // The adminId ties the user to the admin that created them
      permissions: []
    });
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
