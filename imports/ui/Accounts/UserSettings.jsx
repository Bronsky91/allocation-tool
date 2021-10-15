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
import CloseIcon from "@material-ui/icons/Close";
// Packages
import Select from "react-select";
import { ClipLoader } from "react-spinners";
// Components
import { Header } from "../Header";
import { AddUserModal } from "./AddUserModal";
import { UserPermissionsModal } from "./UserPermissions";
import { EditUserModal } from "./EditUserModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
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
  console.log("allMetrics", allMetrics);

  // State
  const [selectedCoa, setSelectedCoa] = useState(chartOfAccounts[0]);
  const [selectedMetric, setSelectedMetric] = useState(allMetrics[0]);
  const [addUserMoalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [userPermissionsOpen, setUserPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [currentOpenUserOption, setCurrentOpenUserOption] = useState("");
  const [possibleAllocationSegmentNames, setPossibleAllocationSegmentNames] =
    useState([]);
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [metricData, setMetricData] = useState([]);
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
    // Updates the selectedUser state when a dropdown is opened
    setSelectedUser(
      allUsers.find((user) => user._id === currentOpenUserOption)
    );
  }, [currentOpenUserOption]);

  useEffect(() => {
    if (metricData.length === 0) {
      setShowMethodSelection(false);
    } else {
      setShowMethodSelection(true);
    }
  }, [metricData]);

  const closeUserDropdown = () => {
    setCurrentOpenUserOption("");
  };

  // TODO: Implement User limit?
  const openAddUserModal = () => {
    setAddUserModalOpen(true);
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

      console.log("segments", segments);

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
      console.log("subSegmentsAdded", subSegmentsAdded);

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
      console.log("subSegmentsRemoved", subSegmentsRemoved);

      // TODO: Create a confirmation box that displays which subsegments are being removed/added
      // TODO: Custom Modal that has removed subsegments on one side and added subsegments on the other

      Meteor.call(
        "chartOfAccounts.segments.update",
        selectedCoa._id,
        segments,
        (err, res) => {
          if (err) {
            console.log(err);
            alert(`Unable to update chart of accounts: ${err.reason}`);
          } else {
            console.log("updated coa", res);
          }
        }
      );
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
    // TODO: Add confirmation
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

  // TODO: Implement proper state for metric onboard controls
  const handleMetricFile = async (e) => {
    // Previous Metric Data
    const prevMetricData = allMetrics.find(
      (metric) => metric._id === selectedMetric._id
    );
    // Segments possible for allocation
    const currentPossibleAllocationSegmentNames = chartOfAccounts
      .find((coa) => coa._id === selectedMetric.coaId)
      .segments.filter(
        (segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description)
      )
      .map((segment) => segment.description);

    setPossibleAllocationSegmentNames(currentPossibleAllocationSegmentNames);

    // Excel File
    const file = e.target.files[0];
    // Formatted Data
    const data = await ReadWorkbook(file);

    if (data && "sheets" in data && data.sheets.length > 0) {
      const rawMetricData = data.sheets[0];
      if (
        rawMetricData.columns.filter((column) =>
          currentPossibleAllocationSegmentNames.includes(column)
        ).length === 0
      ) {
        // Clear metric upload file input
        return alert(
          "No useable segments are detected, check file and upload again"
        );
      }

      // TODO: Create blocks if the user tries to upload stupid stuff. Ex: Adding removing columns (maybe?)

      setMetricData((metricData) => {
        // If the metric data uploaded is already being worked with replace it with new file
        if (metricData.map((m) => m.name).includes(rawMetricData.name)) {
          return metricData.map((data) => {
            if (data.name === rawMetricData.name) {
              return {
                ...rawMetricData,
                validMethods: [],
                metricSegments: rawMetricData.columns.filter((column) =>
                  currentPossibleAllocationSegmentNames.includes(column)
                ),
              };
            }
            return data;
          });
        }
        // Add the upload metric data to the working metricData state object
        return [
          ...metricData,
          {
            ...rawMetricData,
            validMethods: [],
            metricSegments: rawMetricData.columns.filter((column) =>
              currentPossibleAllocationSegmentNames.includes(column)
            ),
          },
        ];
      });
    }
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
                  key={selectedCoa?.updatedAt || selectedCoa?.createdAt}
                  // Using the updatedAt or createAt date as key since this should change once the update is processed
                  // resetting the input to be available for another upload if needed
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
                // onClick={openSaveTemplateModal}
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
                  key={selectedMetric?.updatedAt || selectedMetric?.createdAt}
                  // Using the updatedAt or createAt date as key since this should change once the update is processed
                  // resetting the input to be available for another upload if needed
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

        {/* Metric Add/Edit Panel */}
        {showMethodSelection ? (
          <div className="onboardMetricOnboardContainer">
            <div className="onboardMetricOnboardHeaderContainer">
              <div className="onboardTitle" style={{ marginTop: 0 }}>
                Metric Onboarding
              </div>
              <IconButton
                onClick={() => setShowMethodSelection(false)}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            </div>
            {metricData.map((data, index) => (
              <div className="onboardMetricOnboardInnerContainer" key={index}>
                <div className="onboardMetricOnboardTitle">{data.name}</div>
                <div className="onboardMetricOnboardText">
                  Segments that can be used in allocations
                </div>
                <ul>
                  {possibleAllocationSegmentNames.length > 0
                    ? data.columns.map((column, i) => {
                        if (possibleAllocationSegmentNames.includes(column)) {
                          return (
                            <li key={i} style={{ fontWeight: "bold" }} key={i}>
                              {column}
                            </li>
                          );
                        }
                      })
                    : null}
                </ul>
                <div className="onboardMetricOnboardText">
                  Select methods that will be used for allocations
                </div>
                <div className="onboardMetricOnboardSelectionContainer">
                  <div className="onboardMetricOnboardSelection">
                    <div
                      style={{
                        // borderBottom: "1px solid black",
                        width: "10em",
                        marginBottom: "1em",
                      }}
                    >
                      <button onClick={(e) => handleSelectAll(data.name)}>
                        <label style={{ fontWeight: "bold" }}>
                          {data.validMethods.length ===
                          data.columns.filter(
                            (column) => !data.metricSegments.includes(column)
                          ).length
                            ? "Unselect All"
                            : "Select All"}
                        </label>
                      </button>
                    </div>
                  </div>
                  {possibleAllocationSegmentNames.length > 0
                    ? data.columns.map((column, i) => {
                        // Exclude any columns that match possible allocation segment names
                        if (!possibleAllocationSegmentNames.includes(column)) {
                          return (
                            <div
                              key={i}
                              className="onboardMetricOnboardSelection"
                            >
                              <input
                                type="checkbox"
                                onChange={(e) =>
                                  handleMetricChecked(e, data.name, column)
                                }
                                value={column}
                                checked={data.validMethods.includes(column)}
                              />
                              <label style={{ fontWeight: "bold" }}>
                                {column}
                              </label>
                            </div>
                          );
                        }
                      })
                    : null}
                </div>
                <div>
                  <button
                    // onClick={() => handleSaveMetric(data.name)}
                    className={`onboardMetricOnboardButton ${
                      metricData.find((metric) => metric.name === data.name)
                        .validMethods.length === 0
                        ? "buttonDisabled"
                        : ""
                    }`}
                    disabled={
                      metricData.find((metric) => metric.name === data.name)
                        .validMethods.length === 0
                    }
                  >
                    Save Metric
                  </button>
                  <button
                    className="onboardMetricOnboardButton"
                    style={{
                      backgroundColor: "#f54747",
                      marginLeft: "2em",
                    }}
                    // onClick={() => handleCancelMetric(data.name)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
