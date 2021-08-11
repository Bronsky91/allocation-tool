import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// DB Collections
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { MetricsCollection } from "../../db/MetricsCollection";
// Components
import { Header } from "../Header";

export const UserSettings = () => {
  const user = useTracker(() => Meteor.user());
  const logout = () => Meteor.logout();

  const history = useHistory();

  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user?._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user?._id }).fetch()
  );

  const handleRemoveAllData = () => {
    Meteor.call("segment.removeAll", {}, (err, res) => {
      if (err) {
        // TODO: User alert of errors in the uploaded workbookData
        console.log("Error Deleting Segments", err);
        alert(err);
      } else {
        console.log("Deleted All Segments", res);
      }
    });
    Meteor.call("metric.removeAll", {}, (err, res) => {
      if (err) {
        // TODO: User alert of errors in the uploaded workbookData
        console.log("Error Deleting Metrics", err);
        alert(err);
      } else {
        console.log("Deleted All Metrics", res);
      }
    });
    Meteor.call("allocation.removeAll", {}, (err, res) => {
      if (err) {
        // TODO: User alert of errors in the uploaded workbookData
        console.log("Error Deleting Allocations", err);
        alert(err);
      } else {
        console.log("Deleted All Allocations", res);
      }
    });
  };

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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: "bold" }}>Chart of Accounts:</div>
            <ul>
              {segments.map((segment, index) => (
                <li key={index}>{segment.description}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: "bold" }}>Metrics:</div>
            <ul>
              {metrics.map((metric, index) => (
                <li key={index}>{metric.description}</li>
              ))}
            </ul>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              style={{ margin: 10 }}
              onClick={handleRemoveAllData}
              disabled={segments.length === 0 && metrics.length === 0}
            >
              Delete All Data
            </button>
            {segments.length === 0 && metrics.length === 0 ? (
              <button
                style={{ margin: 10 }}
                onClick={() => history.push("/onboard")}
              >
                Return to Onboarding
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
