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
        <div>
          <ul>
            {allUsers.map((user, index) => (
              <li key={index}>{user.username}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
