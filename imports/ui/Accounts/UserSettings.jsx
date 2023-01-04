import React, { useEffect, useRef, useState } from "react";
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
import { ClipLoader } from "react-spinners";
// Components
import { Header } from "../Header";
import { AddUserModal } from "./AddUserModal";
import { UserPermissionsModal } from "./UserPermissions";
import { EditUserModal } from "./EditUserModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { ConfirmChartOfAccountsUpdateModal } from "./ConfirmChartOfAccountsUpdateModal";
// Constants and Utils
import {
  BLUE,
  CHART_OF_ACCOUNT_COLUMNS,
  GL_CODE,
  SUB_GL_CODE,
  VALID_COLUMN_NAMES,
} from "../../../constants";
import { ReadWorkbook } from "../../utils/ReadWorkbook";
import { isChartOfAccountWorkBookDataValid } from "../../utils/CheckWorkbookData";
import { AddMetricModal } from "./AddMetricModal";
import { EditMetricModal } from "./EditMetricModal";

export const UserSettings = () => {
  // Subscriptions
  Meteor.subscribe("Meteor.user.details");
  Meteor.subscribe("chartOfAccounts");
  Meteor.subscribe("userList");

  const history = useHistory();

  const user = useTracker(() => Meteor.user());
  const otherUsers = useTracker(() =>
    Meteor.users.find({ adminId: user._id }, {}).fetch()
  );
  const allUsers = [user, ...otherUsers];

  const chartOfAccounts = useTracker(() =>
    ChartOfAccountsCollection.find({}).fetch()
  );

  console.log("user", user);
  console.log("chartOfAccounts", chartOfAccounts);

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

  // ** TESTING
  const integrations = [
    { type: "chartOfAccounts", name: "QuickBooks" },
    { type: "metric", name: "Dayforce" },
  ];

  const initialChartOfAccountsDataToConfirm = {
    segments: [],
    subSegmentsAdded: [],
    subSegmentsUpdated: [],
    subSegmentsRemoved: [],
  };

  // State
  const [selectedCoa, setSelectedCoa] = useState(chartOfAccounts[0]);
  const [selectedMetric, setSelectedMetric] = useState(allMetrics[0]);
  // Modals
  const [addUserMoalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [userPermissionsOpen, setUserPermissionsOpen] = useState(false);
  const [editedSelectedCoa, setEditedSelectedCoa] = useState();
  const [editedSelectedMetric, setEditedSelectedMetric] = useState();
  const [
    confirmChartOfAccountsUpdateModalOpen,
    setConfirmChartOfAccountsUpdateModalOpen,
  ] = useState(false);
  const [addMetricModalOpen, setAddMetricModalOpen] = useState(false);
  const [editMetricModalOpen, setEditMetricModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [currentOpenUserOption, setCurrentOpenUserOption] = useState("");
  const [chartOfAccountsDataToConfirm, setChartOfAccountsDataToConfirm] =
    useState(initialChartOfAccountsDataToConfirm);
  const [metricData, setMetricData] = useState();
  const [chartOfAccountsFileKey, setChartOfAccountsFileKey] = useState(
    new Date()
  );
  const [metricFileInputKey, setMetricFileInputKey] = useState(new Date());
  // TODO: Implement these loading icons
  const [chartOfAccountsLoading, setChartOfAccountsLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Ref
  const chartOfAccountsEditInputRef = useRef();
  const metricssEditInputRef = useRef();
  const userRowButtonRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close the dropdown if the user permission modal is open
      if (userPermissionsOpen) {
        return;
      }
      // Don't close the dropdown if the user edit modal is open
      if (editUserModalOpen) {
        return;
      }
      // Don't close the dropdown if the change password modal is open
      if (changePasswordModalOpen) {
        return;
      }
      // Don't close the dropdown if an option is selected
      if (event.target.className === "userDropDownOption") {
        return;
      }
      // Go through each dropdown and check if the click event doesn't contain any dropdowns
      for (let el of userRowButtonRefs.current) {
        if (!el.contains(event.target)) {
          closeUserDropdown();
        }
      }
    };
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // If more modals are added, make sure to include them in the hook effect here
    // Modal checks are added here to keep the state in the handleClickOutside up to date
  }, [
    userRowButtonRefs,
    userPermissionsOpen,
    editUserModalOpen,
    changePasswordModalOpen,
  ]);

  useEffect(() => {
    // After a chart of accounts is edited, update the selectedCoa state to reflect
    // This is required because the next time the user sees the data in the main page we want the data
    // to reflect their most recent changes
    if (
      selectedCoa &&
      editedSelectedCoa &&
      selectedCoa.updatedAt !== editedSelectedCoa
    ) {
      setSelectedCoa(
        chartOfAccounts.find((coa) => coa._id === selectedCoa._id)
      );
      // Once the updated selectedCoa state is refreshed, set the edit flag to undefined
      setEditedSelectedCoa();
    }
  }, [chartOfAccounts]);

  useEffect(() => {
    // After a metric is edited, update the selectedMetric state to reflect
    // This is required because the next time the user sees the data in the main page we want the data
    // to reflect their most recent changes
    if (
      selectedMetric &&
      editedSelectedMetric &&
      selectedMetric.updatedAt !== editedSelectedMetric
    ) {
      setSelectedMetric(
        allMetrics.find((metric) => metric._id === selectedMetric._id)
      );
      // Once the updated selectedCoa state is refreshed, set the edit flag to undefined
      setEditedSelectedMetric();
    }
  }, [allMetrics]);

  useEffect(() => {
    // Updates the selectedUser state when a dropdown is opened
    setSelectedUser(
      allUsers.find((user) => user._id === currentOpenUserOption)
    );
  }, [currentOpenUserOption]);

  const closeUserDropdown = () => {
    setCurrentOpenUserOption("");
  };

  const openAddUserModal = () => {
    if (otherUsers.length < user.userLimit) {
      setAddUserModalOpen(true);
    } else {
      alert(
        `Your current user limit is ${user.userLimit}, please contact Redsky Innovations to add additional users`
      );
    }
  };

  const closeAddUserModal = () => {
    setAddUserModalOpen(false);
  };

  const openEditUserModal = () => {
    setEditUserModalOpen(true);
  };

  const closeEditUserModal = () => {
    setEditUserModalOpen(false);
    closeUserDropdown();
  };

  const openChangePasswordModal = () => {
    setChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setChangePasswordModalOpen(false);
    closeUserDropdown();
  };

  const openUserPermissionModal = () => {
    setUserPermissionsOpen(true);
  };

  const closeUserPermissionsModal = () => {
    setUserPermissionsOpen(false);
    closeUserDropdown();
  };

  const openConfirmChartOfAccountsModal = () => {
    setConfirmChartOfAccountsUpdateModalOpen(true);
  };

  const closeConfirmChartOfAccountsModal = () => {
    setChartOfAccountsDataToConfirm(initialChartOfAccountsDataToConfirm);
    setChartOfAccountsFileKey(new Date());
    setConfirmChartOfAccountsUpdateModalOpen(false);
  };

  const openAddMetricModal = () => {
    if (allMetrics.length < user.metricLimit) {
      setAddMetricModalOpen(true);
    } else {
      alert(
        `Your current metric limit is ${user.metricLimit}, please contact Redsky for additional metrics`
      );
    }
  };

  const closeAddMetricModal = () => {
    setAddMetricModalOpen(false);
  };

  const openEditMetricModal = () => {
    setEditMetricModalOpen(true);
  };

  const closeEditMetricModal = () => {
    setEditMetricModalOpen(false);
  };

  const handleDeleteUser = () => {
    const isConfirmed = confirm(
      `Are you sure you want to delete ${selectedUser.name}?`
    );
    if (isConfirmed) {
      Meteor.call("user.delete", selectedUser._id);
      closeUserDropdown();
    }
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

  const handleChartOfAccountsDelete = () => {
    // Gets current index of selected chart of accounts in the chart of accounts array
    const currentIndex = chartOfAccounts.findIndex(
      (a) => a._id === selectedCoa._id
    );
    const isConfirmed = confirm(
      `Are you sure you want to delete the ${selectedCoa.name} chart of accounts?`
    );
    if (isConfirmed) {
      Meteor.call("chartOfAccounts.remove", selectedCoa._id, (err, res) => {
        if (err) {
          console.log(err);
          alert(`Unable to delete Chart of Accounts: ${err.reason}`);
        } else {
          // Moves the next selectedCoa down one index, unless it's already 0 then keep it 0
          const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          setSelectedCoa(chartOfAccounts[nextIndex]);
        }
      });
    }
  };

  const handleChartOfAccountsFile = async (e) => {
    // TODO: Additional testing for files that may not match sheet segments
    const currentSegments = selectedCoa.segments;
    const validSheetNamesToUpdate = currentSegments.map(
      (segment) => segment.description
    );

    // Excel File
    const file = e.target.files[0];

    // Formatted Data
    const workbookData = await ReadWorkbook(file);
    // Checks if the workbookData is valid
    const output = isChartOfAccountWorkBookDataValid(workbookData);

    // This array is used to hold all the new segment data processed below and sent to Meteor.call()
    let segments = [];

    if (output.valid) {
      // Create the Segments from the Formatted Data
      for (const [index, sheet] of workbookData.sheets.entries()) {
        // If the sheet.name isn't one that was used before ignore the sheet
        // This prevents the user from adding more segments or changing the segment name / chart field order
        if (!validSheetNamesToUpdate.includes(sheet.name)) {
          continue;
        }
        // Since we know the sheet.name is included in the valid sheet names from the previous file
        // we grab the current segment to keep the _id, chartFieldOrder, etc
        const currentSegment = selectedCoa.segments.find(
          (segment) => segment.description === sheet.name
        );
        // Columns object that matches the columns to it's index in the sheet to be inserted properly in the rows map
        const columnIndexRef = sheet.columns.reduce(
          (columnIndexRefObj, columnName, i) => {
            // If the column in the sheet is valid for processing, add it to the object
            if (VALID_COLUMN_NAMES.includes(columnName)) {
              return {
                ...columnIndexRefObj,
                [i]: CHART_OF_ACCOUNT_COLUMNS[columnName],
              };
            }
            // Otherwise return the object as-is and continue
            return columnIndexRefObj;
          },
          {}
        );

        const subSegments = sheet.rows
          .filter((row) => row.length > 1)
          .map((row) => {
            const subSegment = {};
            row.map((r, i) => {
              // This makes sure it only assigns values to valid columns
              if (
                Object.keys(columnIndexRef)
                  .map((c) => Number(c)) // Need to convert to number because Object.keys() makes strings
                  .includes(i)
              ) {
                subSegment[columnIndexRef[i]] = r.value;
              }
            });
            return subSegment;
          });

        // The only thing we're really changing for each segment are the subsegments
        segments.push({
          ...currentSegment,
          subSegments,
        });
      }

      // subSegments with new segmentIds
      const subSegmentsAdded = segments.flatMap((segment) => {
        const oldSegment = currentSegments.find(
          (currrentSegment) => currrentSegment._id === segment._id
        );
        return segment.subSegments.filter(
          (subSegment) =>
            !oldSegment.subSegments
              .map((s) => s.segmentId.toString())
              .includes(subSegment.segmentId.toString())
        );
      });

      // subSegments with new descriptions but same segmentIds
      const subSegmentsUpdated = segments.flatMap((segment) => {
        const oldSegment = currentSegments.find(
          (currrentSegment) => currrentSegment._id === segment._id
        );
        return segment.subSegments.filter(
          (subSegment) =>
            !oldSegment.subSegments
              .map((s) => s.description)
              .includes(subSegment.description) &&
            oldSegment.subSegments
              .map((s) => s.segmentId.toString())
              .includes(subSegment.segmentId.toString())
        );
      });

      // subSegments that were removed, the segmentIds are no longer in the sheet
      const subSegmentsRemoved = currentSegments.flatMap((oldSegment) => {
        const newSegment = segments.find(
          (segment) => segment._id === oldSegment._id
        );
        return oldSegment.subSegments.filter(
          (oldSubSegment) =>
            !newSegment.subSegments
              .map((s) => s.segmentId.toString())
              .includes(oldSubSegment.segmentId.toString())
        );
      });

      setChartOfAccountsDataToConfirm({
        segments,
        subSegmentsAdded,
        subSegmentsUpdated,
        subSegmentsRemoved,
      });

      // If true, there are no changes to make to the chart of accounts
      const noChangesToMake =
        JSON.stringify(currentSegments) === JSON.stringify(segments);
      if (noChangesToMake) {
        alert(
          `There are no changes to make to ${selectedCoa.name} using the file uploaded`
        );
      } else {
        openConfirmChartOfAccountsModal();
      }
    } else {
      // Displays an alert to the user and an error message why the chart of the accounts isn't valid
      alert(output.err);
    }
  };

  const handleMetricDelete = () => {
    // Gets current index of selected chart of accounts in the chart of accounts array
    const currentIndex = allMetrics.findIndex(
      (a) => a._id === selectedMetric._id
    );
    const isConfirmed = confirm(
      `Are you sure you want to delete the ${selectedMetric.description} - ${selectedMetric.coaName} metric?`
    );
    if (isConfirmed) {
      Meteor.call(
        "chartOfAccounts.metrics.remove",
        selectedMetric.coaId,
        selectedMetric._id,
        (err, res) => {
          if (err) {
            console.log(err);
            alert(`Unable to delete Metric: ${err.reason}`);
          } else {
            // Moves the next selectedmetric down one index, unless it's already 0 then keep it 0
            const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
            setSelectedMetric(allMetrics[nextIndex]);
          }
        }
      );
    }
  };

  const handleMetricFile = async (e) => {
    // Segments possible for allocation
    const metricCoa = chartOfAccounts.find(
      (coa) => coa._id === selectedMetric.coaId
    );
    const possibleAllocationSegmentNames = metricCoa?.segments
      .filter(
        (segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description)
      )
      .map((segment) => segment.description);

    setMetricsLoading(true);
    // Excel File
    const file = e.target.files[0];
    // Formatted Data
    const data = await ReadWorkbook(file);

    if (data && "sheets" in data && data.sheets.length > 0) {
      const rawMetricData = data.sheets[0];
      if (
        rawMetricData.columns.filter((column) =>
          possibleAllocationSegmentNames.includes(column)
        ).length === 0
      ) {
        // Clear metric upload file input
        setMetricFileInputKey(new Date());
        setMetricsLoading(false);
        return alert("No segments are detected, check file and upload again");
      }
      setMetricData({
        ...rawMetricData,
        validMethods: selectedMetric.validMethods.filter((method) =>
          rawMetricData.columns.includes(method)
        ),
        metricSegments: rawMetricData.columns.filter((column) =>
          possibleAllocationSegmentNames.includes(column)
        ),
      });
    }
    // Clear metric upload file input
    setMetricFileInputKey(new Date());
    setMetricsLoading(false);
    openEditMetricModal();
  };

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="userAccountParentContainer">
      <Header />
      <AddUserModal open={addUserMoalOpen} handleClose={closeAddUserModal} />
      <EditUserModal
        open={editUserModalOpen}
        handleClose={closeEditUserModal}
        selectedUser={selectedUser}
      />
      <ChangePasswordModal
        open={changePasswordModalOpen}
        handleClose={closeChangePasswordModal}
        selectedUser={selectedUser}
      />
      <UserPermissionsModal
        open={userPermissionsOpen}
        handleClose={closeUserPermissionsModal}
        selectedUser={selectedUser}
        chartOfAccounts={chartOfAccounts}
      />
      <ConfirmChartOfAccountsUpdateModal
        open={confirmChartOfAccountsUpdateModalOpen}
        handleClose={closeConfirmChartOfAccountsModal}
        selectedCoa={selectedCoa}
        chartOfAccountsDataToConfirm={chartOfAccountsDataToConfirm}
        setEditedSelectedCoa={setEditedSelectedCoa}
      />
      <AddMetricModal
        open={addMetricModalOpen}
        handleClose={closeAddMetricModal}
        chartOfAccounts={chartOfAccounts}
      />
      <EditMetricModal
        open={editMetricModalOpen}
        handleClose={closeEditMetricModal}
        selectedMetric={selectedMetric}
        metricData={metricData}
        setMetricData={setMetricData}
        setEditedSelectedMetric={setEditedSelectedMetric}
        metricCoa={chartOfAccounts.find(
          (coa) => coa._id === selectedMetric?.coaId
        )}
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
              <div
                style={{ color: "#3597fe", fontSize: 18, fontWeight: "bold" }}
              >
                User Management
              </div>
              <button className="addUserButton" onClick={openAddUserModal}>
                Add User
              </button>
            </div>

            <table className="userManagementTable">
              <tbody>
                <tr style={{ border: "none" }}>
                  <th style={{ width: "40px" }}></th>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
                {allUsers.map((user, index) => (
                  <tr key={index}>
                    <td ref={(el) => (userRowButtonRefs.current[index] = el)}>
                      <div
                        className="userDropDownButton"
                        onClick={() => {
                          setCurrentOpenUserOption((currentOption) =>
                            currentOption === user._id ? "" : user._id
                          );
                        }}
                      >
                        {currentOpenUserOption === user._id ? (
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
                        style={{
                          display:
                            currentOpenUserOption === user._id
                              ? "flex"
                              : "none",
                          height: user.admin ? 50 : 110,
                        }}
                      >
                        <div
                          className="userDropDownOption"
                          onClick={openEditUserModal}
                        >
                          Edit User Info
                        </div>
                        {!user.admin ? (
                          <div
                            className="userDropDownOption"
                            onClick={openUserPermissionModal}
                          >
                            Edit Permissions
                          </div>
                        ) : null}
                        <div
                          className="userDropDownOption"
                          onClick={openChangePasswordModal}
                        >
                          Change Password
                        </div>
                        {!user.admin ? (
                          <div
                            className="userDropDownOption"
                            onClick={handleDeleteUser}
                          >
                            Delete
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>
                      {user.email || user.emails.length > 0
                        ? user.emails[0].address
                        : ""}
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
                value={
                  chartOfAccounts
                    .map((coa) => ({
                      value: coa._id,
                      label: coa.name,
                    }))
                    .find(
                      (coaOption) => coaOption.value === selectedCoa?._id
                    ) || null
                }
                onChange={handleChartOfAccountChange}
                className="settingSelect"
                options={chartOfAccounts.map((coa) => ({
                  value: coa._id,
                  label: coa.name,
                }))}
              />
              <IconButton
                color="inherit"
                onClick={() => {
                  history.push("/import");
                }}
                style={{ color: "#3597fe" }}
              >
                <AddIcon fontSize="default" />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => chartOfAccountsEditInputRef.current.click()}
                style={{ color: "#60cead" }}
              >
                <EditIcon fontSize="small" />
                <input
                  type="file"
                  id="coa-upload"
                  accept=".xls,.xlsx"
                  ref={chartOfAccountsEditInputRef}
                  onChange={handleChartOfAccountsFile}
                  key={chartOfAccountsFileKey}
                />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={handleChartOfAccountsDelete}
                style={{ color: "#f54747" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {chartOfAccountsLoading ? (
                <ClipLoader
                  color={BLUE}
                  loading={chartOfAccountsLoading}
                  size={25}
                  css={`
                    margin-left: 10px;
                  `}
                />
              ) : null}
            </div>
            <div style={{ display: "flex" }}>
              <div>
                Managed by{" "}
                <span style={{ fontWeight: "bold" }}>Quickbooks</span>
              </div>
            </div>
            <div className="subContainerTopBlock">
              {selectedCoa ? (
                <div>
                  <div style={{ fontWeight: "bold" }}>Segments:</div>
                  <ul>
                    {selectedCoa.segments.map((segment, index) => (
                      <li key={index}>{segment.description}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
          <div className="topBlock">
            <div style={{ fontWeight: "bold", fontSize: 18 }}>Metrics</div>
            <div className="selectRowTopBlock">
              <Select
                value={
                  allMetrics
                    .map((metric) => ({
                      value: metric._id,
                      label: `${metric.description} - ${metric.coaName}`,
                    }))
                    .find(
                      (metricOption) =>
                        metricOption.value === selectedMetric?._id
                    ) || null
                }
                onChange={handleMetricChange}
                className="settingSelect"
                options={allMetrics.map((metric) => ({
                  value: metric._id,
                  label: `${metric.description} - ${metric.coaName}`,
                }))}
              />
              <IconButton
                color="inherit"
                onClick={openAddMetricModal}
                style={{ color: "#3597fe" }}
              >
                <AddIcon fontSize="default" />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => {
                  metricssEditInputRef.current.click();
                }}
                style={{ color: "#60cead" }}
              >
                <EditIcon fontSize="small" />
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  ref={metricssEditInputRef}
                  onChange={handleMetricFile}
                  key={metricFileInputKey}
                />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={handleMetricDelete}
                style={{ color: "#f54747" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {metricsLoading ? (
                <ClipLoader
                  color={BLUE}
                  loading={metricsLoading}
                  size={25}
                  css={`
                    margin-left: 10px;
                  `}
                />
              ) : null}
            </div>
            <div style={{ display: "flex" }}>
              <div>
                Managed by <span style={{ fontWeight: "bold" }}>Dayforce</span>
              </div>
              {/* <button>Manage Integration</button> */}
            </div>
            <div className="subContainerTopBlock">
              {selectedMetric ? (
                <div>
                  <div style={{ fontWeight: "bold" }}>Connected Segments:</div>
                  <ul>
                    {selectedMetric.metricSegments.map(
                      (metricSegment, index) => (
                        <li key={index}>{metricSegment}</li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}
              {selectedMetric ? (
                <div>
                  <div style={{ fontWeight: "bold" }}>Methods:</div>
                  <ul>
                    {selectedMetric.validMethods.map((method, index) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
