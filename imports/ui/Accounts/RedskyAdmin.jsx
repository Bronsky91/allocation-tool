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
  console.log("user", user);

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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Welcome to the super secret Redsky admin page
      </div>
    </div>
  );
};
