import React, { useState } from "react";
import { Redirect } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// DB Collections
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { MetricsCollection } from "../../db/MetricsCollection";
// Components
import { Header } from "../Header";

export const UserAccount = () => {
  const user = useTracker(() => Meteor.user());
  const logout = () => Meteor.logout();

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
          height: "50vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div> User Account Page for {user.username}</div>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
};
