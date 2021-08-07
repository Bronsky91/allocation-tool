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

  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user?._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user?._id }).fetch()
  );

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div> User Account Page for {user.username}</div>
          <button onClick={logout}>Logout</button>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: "bold" }}>Chart of Accounts:</div>
            <ul>
              {segments.map((segment) => (
                <li>{segment.description}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: "bold" }}>Metrics:</div>
            <ul>
              {metrics.map((metric) => (
                <li>{metric.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
