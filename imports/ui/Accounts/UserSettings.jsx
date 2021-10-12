import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// DB Collections
import { ChartOfAccountsCollection } from "../../db/ChartOfAccountsCollection";
// Material UI
import { IconButton } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
// Packages
import Select from "react-select";
// Components
import { Header } from "../Header";
import { AddUserModal } from "./AddUserModal";
import { UserPermissionsModal } from "./UserPermissions";
import { ChartOfAccountsModal } from "./ChartOfAccountsModal";
import { MetricsModal } from "./MetricsModal";
import { customSelectStyles } from "../../../constants";

export const UserSettings = () => {
  // Subscriptions
  Meteor.subscribe("chartOfAccounts");
  Meteor.subscribe("userList");

  const user = useTracker(() => Meteor.user());
  const otherUsers = useTracker(() =>
    Meteor.users.find({ adminId: user._id }, {}).fetch()
  );
  const allUsers = [user, ...otherUsers];

  const chartOfAccounts = useTracker(() =>
    ChartOfAccountsCollection.find({}).fetch()
  );

  const allMetrics = chartOfAccounts
    .map((coa) => ({
      ...coa,
      metrics: coa.metrics.map((metric) => ({
        ...metric,
        coaName: coa.name,
        coaId: coa._id,
      })),
    }))
    .reduce(
      (prevMetric, currentCoa) => [...prevMetric, ...currentCoa.metrics],
      []
    );
  console.log("chartOfAccounts", chartOfAccounts);

  const [selectedCoa, setSelectedCoa] = useState(chartOfAccounts[0]);
  const [selectedMetric, setSelectedMetric] = useState(allMetrics[0]);
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [addUserMoalOpen, setAddUserModalOpen] = useState(false);
  const [userPermissionsOpen, setUserPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const openAddUserModal = () => {
    setAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setAddUserModalOpen(false);
  };

  const openUserPermissionModal = (userId) => {
    setSelectedUser(otherUsers.find((user) => user._id === userId));
    setUserPermissionsOpen(true);
  };

  const closeUserPermissionsModal = () => {
    setUserPermissionsOpen(false);
  };

  const handleDeleteUser = (userId) => {
    Meteor.call("user.delete", userId);
  };

  const handleChartOfAccountChange = (c) => {
    const newSelectedChartOfAccounts = chartOfAccounts.find(
      (coa) => coa._id === c.value
    );
    setSelectedCoa(newSelectedChartOfAccounts);
  };

  const handleMetricChange = (m) => {
    const newSelectedMetric = allMetrics.find(
      (metric) => metric._id === m.value
    );
    setSelectedMetric(newSelectedMetric);
  };

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="userAccountParentContainer">
      <Header />
      <AddUserModal open={addUserMoalOpen} handleClose={closeAddUserModal} />
      <UserPermissionsModal
        open={userPermissionsOpen}
        handleClose={closeUserPermissionsModal}
        selectedUser={selectedUser}
        chartOfAccounts={chartOfAccounts}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="topBlockContainer">
          <div className="tableContainer">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div>User Management</div>
              <button>Add User</button>
            </div>

            <table className="userManagementTable">
              <tbody>
                <tr style={{ border: "none" }}>
                  <th></th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
                {allUsers.map((user, index) => (
                  <tr key={index}>
                    <td>
                      <div
                        className="userDropDownButton"
                        onClick={() => {
                          setShowUserOptions(!showUserOptions);
                        }}
                      >
                        {showUserOptions ? (
                          <ExpandLessIcon
                            fontSize="small"
                            style={{ color: "#3597fe" }}
                          />
                        ) : (
                          <ExpandMoreIcon
                            fontSize="small"
                            style={{ color: "#3597fe" }}
                          />
                        )}
                      </div>
                      <div
                        className="userDropDownContainer"
                        style={{ display: showUserOptions ? "block" : "none" }}
                      >
                        Testing
                      </div>
                    </td>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {!user.admin ? (
                        <button
                          onClick={() => openUserPermissionModal(user._id)}
                        >
                          Change
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bottomBlockContainer">
          <div className="topBlock">
            <div style={{ fontWeight: "bold", fontSize: 18 }}>
              Chart of Accounts
            </div>

            <div className="selectRowTopBlock">
              <Select
                value={chartOfAccounts
                  .map((coa) => ({
                    value: coa._id,
                    label: coa.name,
                  }))
                  .find((coaOption) => coaOption.value === selectedCoa?._id)}
                onChange={handleChartOfAccountChange}
                className="settingSelect"
                options={chartOfAccounts.map((coa) => ({
                  value: coa._id,
                  label: coa.name,
                }))}
              />
              <IconButton
                color="inherit"
                // onClick={openSaveTemplateModal}
                style={{ color: "#3597fe" }}
              >
                <AddIcon fontSize="default" />
              </IconButton>
              <IconButton
                color="inherit"
                // onClick={openEditTemplateModal}
                style={{ color: "#60cead" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="inherit"
                // onClick={handleDeleteTemplate}
                style={{ color: "#f54747" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
            <div className="subContainerTopBlock">
              <div>
                <div style={{ fontWeight: "bold" }}>Segments:</div>
                <ul>
                  {selectedCoa
                    ? selectedCoa.segments.map((segment, index) => (
                        <li key={index}>{segment.description}</li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
          </div>
          <div className="topBlock">
            <div style={{ fontWeight: "bold", fontSize: 18 }}>Metrics</div>
            <div className="selectRowTopBlock">
              <Select
                value={allMetrics
                  .map((metric) => ({
                    value: metric._id,
                    label: `${metric.description} - ${metric.coaName}`,
                  }))
                  .find(
                    (metricOption) => metricOption.value === selectedMetric?._id
                  )}
                onChange={handleMetricChange}
                className="settingSelect"
                options={allMetrics.map((metric) => ({
                  value: metric._id,
                  label: `${metric.description} - ${metric.coaName}`,
                }))}
              />
              <IconButton
                color="inherit"
                // onClick={openSaveTemplateModal}
                style={{ color: "#3597fe" }}
              >
                <AddIcon fontSize="default" />
              </IconButton>
              <IconButton
                color="inherit"
                // onClick={openEditTemplateModal}
                style={{ color: "#60cead" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="inherit"
                // onClick={handleDeleteTemplate}
                style={{ color: "#f54747" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
            <div className="subContainerTopBlock">
              <div>
                <div style={{ fontWeight: "bold" }}>Connected Segments:</div>
                <ul>
                  {selectedMetric
                    ? selectedMetric.metricSegments.map(
                        (metricSegment, index) => (
                          <li key={index}>{metricSegment}</li>
                        )
                      )
                    : null}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>Methods:</div>
                <ul>
                  {selectedMetric
                    ? selectedMetric.validMethods.map((method, index) => (
                        <li key={index}>{method}</li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* {user.admin ? (
          <button style={{ margin: 10 }} onClick={openAddUserModal}>
            Add User
          </button>
        ) : null} */}
      </div>
    </div>
  );
};
