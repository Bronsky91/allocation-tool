import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// DB Collections
import { ChartOfAccountsCollection } from "../../db/ChartOfAccountsCollection";
// Components
import { Header } from "../Header";
import { AddUserModal } from "./AddUserModal";

export const UserSettings = () => {
  const [addUserMoalOpen, setAddUserModalOpen] = useState(false);

  // Subscriptions
  Meteor.subscribe("chartOfAccounts");
  Meteor.subscribe("userList");

  const user = useTracker(() => Meteor.user());
  const allUsers = useTracker(() =>
    Meteor.users.find({ adminId: user._id }, {}).fetch()
  );
  console.log("allUsers", allUsers);

  const history = useHistory();

  const chartOfAccounts = useTracker(() =>
    ChartOfAccountsCollection.find({}).fetch()
  );

  const openAddUserModal = () => {
    setAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setAddUserModalOpen(false);
  };

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
        <AddUserModal open={addUserMoalOpen} handleClose={closeAddUserModal} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginTop: 10 }}>
            {chartOfAccounts.length > 0 ? (
              <div style={{ fontWeight: "bold" }}>Chart of Accounts:</div>
            ) : null}

            {chartOfAccounts.map((coa, index) => (
              <ul key={index}>
                <li>{coa.name}</li>
                <ul>
                  <li>Segments:</li>
                  <ul>
                    {coa.segments.map((segment) => (
                      <li key={segment._id}>{segment.description}</li>
                    ))}
                  </ul>
                  <li>Metrics:</li>
                  <ul>
                    {coa.metrics.map((metric) => (
                      <li key={metric._id}>{metric.description}</li>
                    ))}
                  </ul>
                </ul>
              </ul>
            ))}
          </div>

          {user.admin ? (
            <div>
              <div style={{ fontWeight: "bold" }}>Users:</div>
              {allUsers.map((user, index) => (
                <ul key={index}>
                  <li>Name - {user.name}</li>
                  <ul>
                    <li>TODO: Update Permissions</li>
                  </ul>
                </ul>
              ))}
            </div>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column" }}>
            {user.admin ? (
              <button style={{ margin: 10 }} onClick={openAddUserModal}>
                Add User
              </button>
            ) : null}
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
