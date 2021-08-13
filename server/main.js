import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
// API
import "/imports/api/AllocationMethods";
import "/imports/api/MetricMethods";
import "/imports/api/SegmentMethods";
// Publications
import "/imports/api/AllocationPublications";
import "/imports/api/MetricPublications";
import "/imports/api/SegmentPublications";
import "/imports/api/UserPublications";
// Utils
import { calcAllocation } from "./CalcAllocation";

// Arrow functions aren't going to work with these Methods while using this.userId
Meteor.methods({
  calculateAllocation: function ({
    subSegments,
    method,
    toBalanceValue,
    userId,
    metricId,
  }) {
    // console.log("What do subSegments look like?", subSegments);
    // TODO: run check
    return calcAllocation({
      subSegments,
      method,
      toBalanceValue,
      userId,
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
  // Default redskyAdmins to have paid accounts
  user.paid = options.redskyAdmin;

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
      redskyAdmin: true,
    });
    Accounts.createUser({
      username: SECOND_SEED_USERNAME,
      password: SECOND_SEE_PASSWORD,
      redskyAdmin: true,
    });
    Accounts.createUser({
      username: "test",
      password: "test",
      redskyAdmin: false,
    });
  }
});
