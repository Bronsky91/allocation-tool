import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Components
import { Header } from "../Header";

export const RedskyAdmin = () => {
  Meteor.subscribe("userListRedsky");

  const user = useTracker(() => Meteor.user());
  const allUsers = useTracker(() => Meteor.users.find({}, {}).fetch());
  // TODO: Probably should filter out users that don't have adminIds (meaning that their admin created)
  console.log("allUsers", allUsers);
  const history = useHistory();

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        Welcome to the super secret Redsky admin page
        <div style={{ marginTop: 10 }}>
          User List
          {allUsers.map((user, index) => (
            <ul>
              <li>{user.name}</li>
              <ul>
                <li>
                  Client Admin - {user.admin ? "Yes" : "No"}
                  <button
                    style={{ marginLeft: 5 }}
                    onClick={() =>
                      Meteor.call("user.admin.toggle", {
                        id: user._id,
                        admin: !user.admin,
                      })
                    }
                  >
                    Toggle
                  </button>
                </li>
              </ul>
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};
