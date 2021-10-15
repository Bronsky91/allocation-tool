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
    return Accounts.createUser({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      redskyAdmin: false,
      admin: false,
      adminId: this.userId, // The adminId ties the user to the admin that created them
      permissions: {
        chartOfAccounts: [],
        metrics: [],
        allocations: [],
        templates: [],
        createTemplates: false,
        createAllocations: false,
      },
    });
  },
  "user.delete": function (id) {
    // Only admins can delete users
    if (!this.userId || !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }
    if (this.userId === id) {
      throw new Meteor.Error("A user cannot delete themselves");
    }
    Meteor.users.remove({ _id: id });
  },
  "user.name.update": function (name) {
    return Meteor.users.update(
      { _id: this.userId },
      {
        $set: {
          name,
        },
      }
    );
  },
  "user.email.update": function (email) {
    const oldEmail = Meteor.user()?.emails[0];
    // If the new email is different then what's already on the account
    if (email !== oldEmail?.address) {
      // Add the new email and if it's unable to get added it will a throw an error to the Meteor.call()
      Accounts.addEmail(this.userId, email);
      // If the new email was added then we can remove the old email
      Accounts.removeEmail(this.userId, oldEmail.address);
    }
  },
  "user.permissions.update": function (userId, key, keyValue) {
    // Only admins can update permissions
    if (!this.userId || !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }

    return Meteor.users.update(
      { _id: userId }, // Using userId as a param because the admin is update other users
      {
        $set: {
          // Using set here instead of $push/$pull to match UI function (saving state of array instead of pushing or pulling one at a time)
          [`permissions.${key}`]: keyValue,
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
