import React from "react";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Link, Redirect, useHistory } from "react-router-dom";

export const Header = () => {
  const user = useTracker(() => Meteor.user());
  const logout = () => Meteor.logout();

  const history = useHistory();

  return (
    <div className="user">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          Currently logged in as:
          <span style={{ paddingLeft: 5, fontWeight: "bold" }}>
            {user.username}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <button
            style={{
              width: "5em",
              alignSelf: "center",
              marginTop: "1em",
            }}
            onClick={() => history.push("/account")}
          >
            Account
          </button>
          <button
            style={{
              width: "5em",
              alignSelf: "center",
              marginTop: "1em",
            }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
