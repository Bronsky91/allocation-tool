import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// DB Collections
import { ChartOfAccountsCollection } from "../../db/ChartOfAccountsCollection";
// Components
import { Header } from "../Header";

export const UserSettings = () => {
  // Subscriptions
  Meteor.subscribe("chartOfAccounts");
  Meteor.subscribe("Meteor.user.redskyAdmin");

  const user = useTracker(() => Meteor.user());
  const logout = () => Meteor.logout();

  const history = useHistory();

  const chartOfAccounts = useTracker(() =>
    ChartOfAccountsCollection.find({}).fetch()
  );

  const handleRemoveAllData = () => {
    Meteor.call("chartOfAccounts.removeAll", {}, (err, res) => {
      if (err) {
        // TODO: User alert of errors in the uploaded workbookData
        console.log("Error Deleting Segments", err);
        alert(err);
      } else {
        console.log("Deleted All Segments", res);
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

            {chartOfAccounts.map((coa, index) => (
              <ul key={index}>
                <li>{coa.name}</li>
                <ul>
                  <li>Segments:</li>
                  <ul>
                    {coa.segments.map((segment) => (
                      <li>{segment.description}</li>
                    ))}
                  </ul>
                  <li>Metrics:</li>
                  <ul>
                    {coa.metrics.map((metric) => (
                      <li>{metric.description}</li>
                    ))}
                  </ul>
                </ul>
              </ul>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              style={{ margin: 10 }}
              onClick={handleRemoveAllData}
              disabled={chartOfAccounts.length === 0}
            >
              Delete All Data
            </button>
            {chartOfAccounts.length === 0 ? (
              <button
                style={{ margin: 10 }}
                onClick={() => history.push("/onboard")}
              >
                Return to Onboarding
              </button>
            ) : null}
            {user.redskyAdmin ? (
              <button onClick={() => history.push("/admin")}>
                Admin Panel
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
