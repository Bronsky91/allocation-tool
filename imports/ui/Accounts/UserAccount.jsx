import React, { useState } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { MetricsCollection } from "../../db/MetricsCollection";

export const UserAccount = () => {
  const user = useTracker(() => Meteor.user());
  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user._id }).fetch()
  );

  console.log(user);
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div> User Account Page for {user.username}</div>
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
  );
};
