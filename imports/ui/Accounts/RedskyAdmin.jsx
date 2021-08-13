import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Components
import { Header } from "../Header";

export const RedskyAdmin = () => {
  Meteor.subscribe("userList");

  const user = useTracker(() => Meteor.user());
  const allUsers = useTracker(() => Meteor.users.find({}, {}).fetch());
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
          <ul>
            {allUsers.map((user, index) => (
              <li key={index}>
                {user.username} - admin:{user.redskyAdmin ? "Yes" : "No"}
                <button
                  style={{ marginLeft: 5 }}
                  onClick={() =>
                    Meteor.call("user.admin", {
                      id: user._id,
                      admin: !user.redskyAdmin,
                    })
                  }
                >
                  Toggle Admin
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
