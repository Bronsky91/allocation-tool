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
import { UserPermissionsModal } from "./UserPermissions";

export const UserSettings = () => {
  const [addUserMoalOpen, setAddUserModalOpen] = useState(false);
  const [userPermissionsOpen, setUserPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

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

  const openUserPermissionModal = (userId) => {
    setSelectedUser(allUsers.find((user) => user._id === userId));
    setUserPermissionsOpen(true);
  };

  const closeUserPermissionsModal = () => {
    setUserPermissionsOpen(false);
  };

  const handleDeleteUser = (userId) => {
    Meteor.call("user.delete", userId);
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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AddUserModal open={addUserMoalOpen} handleClose={closeAddUserModal} />
        <UserPermissionsModal
          open={userPermissionsOpen}
          handleClose={closeUserPermissionsModal}
          selectedUser={selectedUser}
          chartOfAccounts={chartOfAccounts}
        />
        <div className="userSettingsMainButtonsContainer">
          <button>Update Chart of Accounts</button>
          <button>Update Metrics</button>
          <button>Standard Techniques</button>
          <button>Standard Templates</button>
        </div>
        {user.admin ? (
          <button style={{ margin: 10 }} onClick={openAddUserModal}>
            Add User
          </button>
        ) : null}

        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Permissions</th>
            </tr>
            {allUsers.map((user, index) => (
              <tr key={index}>
                <td>
                  <button>Update</button>
                  <button onClick={() => handleDeleteUser(user._id)}>
                    Delete
                  </button>
                </td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => openUserPermissionModal(user._id)}>
                    {user.permissions.length > 0 ? "Change" : "Add"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ### THIS IS TEMP FOR REDSKY */}
        <div style={{ display: "flex", flexDirection: "column" }}>
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
                Redsky Admin Panel
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
