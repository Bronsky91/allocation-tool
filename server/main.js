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

Accounts.onCreateUser((options, user) => {
  // User's actual name, used in Journal Entries
  user.name = options.name;
  // User's Email, used for password resets, etc
  user.email = options.email;
  // RedskyAdmins are people that work for Redsky and manage users
  user.redskyAdmin = options.redskyAdmin;
  // Admins are Client Admins that pay for the tool
  user.admin = options.admin;

  return user;
});

const SEED_USERNAME = "bronsky";
const SEED_PASSWORD = "password";

const SECOND_SEED_USERNAME = "nate";
const SECOND_SEE_PASSWORD = "password";

Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
      name: "Bryan Reed",
      email: "bryan@redsky.com",
      redskyAdmin: true,
      admin: true,
    });
    Accounts.createUser({
      username: SECOND_SEED_USERNAME,
      password: SECOND_SEE_PASSWORD,
      name: "Nate Curi",
      email: "nate@dci.com",
      redskyAdmin: true,
      admin: true,
    });
  }
});
