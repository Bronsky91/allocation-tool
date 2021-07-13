import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
// API
import "/imports/api/AllocationMethods";
import "/imports/api/MetricMethods";
import "/imports/api/SegmentMethods";
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
    console.log("What do subSegments look like?", subSegments);
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

const SEED_USERNAME = "bronsky";
const SEED_PASSWORD = "password";

const SECOND_SEED_USERNAME = "nate";
const SECOND_SEE_PASSWORD = "password";

Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
    Accounts.createUser({
      username: SECOND_SEED_USERNAME,
      password: SECOND_SEE_PASSWORD,
    });
  }
});
