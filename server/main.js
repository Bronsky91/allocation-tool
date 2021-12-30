import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
// API
import "/imports/api/ChartOfAccountMethods";
import "/imports/api/UserMethods";
// Publications
import "/imports/api/ChartOfAccountPublications";
import "/imports/api/UserPublications";
// Utils
import { calcAllocation } from "./CalcAllocation";

// Arrow functions aren't going to work with these Methods while using this.userId
Meteor.methods({
  calculateAllocation: function ({
    chartOfAccountsId,
    subSegments,
    method,
    toBalanceValue,
    metricId,
  }) {
    // console.log("What do subSegments look like?", subSegments);
    // TODO: run check
    return calcAllocation({
      chartOfAccountsId,
      subSegments,
      method,
      toBalanceValue,
      metricId,
    });
  },
});

Accounts.emailTemplates.siteName = "Redsky Innovations - Allocation Tool";
Accounts.emailTemplates.from = "Redsky Innovations <accounts@redsky.support>";

Accounts.onCreateUser((options, user) => {
  // User's actual name, used in Journal Entries
  user.name = options.name;
  // User's Email, used for password resets, etc
  user.email = options.email;
  // RedskyAdmins are people that work for Redsky and manage users
  user.redskyAdmin = options.redskyAdmin;
  // Admins are Client Admins that pay for the tool
  user.admin = options.admin;
  // Flag that shows if the user as an admin or not
  user.hasAdmin = !!options?.adminId; // If the field exists then show boolean as true

  if (user.hasAdmin) {
    // Users created by admin's have adminId that ties them together
    user.adminId = options?.adminId || "";
    // Users that aren't admins need permissions
    user.permissions = options?.permissions || [];
  } else {
    // Paywalls for # of users and metrics for users that are created on the registration page
    user.userLimit = options.userLimit || 1;
    user.metricLimit = options.metricLimit || 1;
  }

  return user;
});

const SEED_USERNAME = "bronsky";
const SEED_PASSWORD = "password";

const SECOND_SEED_USERNAME = "nate";
const SECOND_SEE_PASSWORD = "password";

Meteor.startup(() => {
  Accounts.urls.resetPassword = (token) => {
    return Meteor.absoluteUrl(`reset-password/${token}`);
  };
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
      name: "Bryan Reed",
      email: "bryan87reed@gmail.com",
      redskyAdmin: true,
      admin: true,
    });
    Accounts.createUser({
      username: SECOND_SEED_USERNAME,
      password: SECOND_SEE_PASSWORD,
      name: "Nate Curi",
      email: "nate@redsky.com",
      redskyAdmin: true,
      admin: true,
    });
  }
});
