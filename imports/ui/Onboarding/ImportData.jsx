import React, { useState, useEffect } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// React Router
import { Redirect, useHistory } from "react-router-dom";
// Utils
import { ReadWorkbook } from "../../utils/ReadWorkbook";
import { isChartOfAccountWorkBookDataValid } from "../../utils/CheckWorkbookData";
// DB
import { ChartOfAccountsCollection } from "../../db/ChartOfAccountsCollection";
// Constants
import {
  BLUE,
  CHART_OF_ACCOUNT_COLUMNS,
  GL_CODE,
  SUB_GL_CODE,
  VALID_COLUMN_NAMES,
} from "../../../constants";
// Material UI
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
// Components
import { Header } from "../Header";
// Packages
import BarLoader from "react-spinners/BarLoader";

export const ImportData = () => {
  // Subscriptions
  Meteor.subscribe("chartOfAccounts");

  // Current user logged in
  const user = useTracker(() => Meteor.user());

  const history = useHistory();

  // metricData is uploaded metrics sheets and worked data before saving
  const [fileName, setFileName] = useState("");
  const [metricFileName, setMetricFileName] = useState("");
  const [importPage, setImportPage] = useState("segments");
  const [segments, setSegments] = useState([]);
  const [metricData, setMetricData] = useState([]);
  const [showSegments, setShowSegments] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showMetricOnboard, setShowMetricOnboard] = useState(false);
  const [chartOfAccountsFileInputKey, setChartOfAccountsFileInputKey] =
    useState(new Date());
  const [metricFileInputKey, setMetricFileInputKey] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Segments possible for allocation
  const possibleAllocationSegmentNames = segments
    .filter((segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description))
    .map((segment) => segment.description);

  useEffect(() => {
    if (metricData.length === 0) {
      setShowMetricOnboard(false);
    } else {
      setShowMetricOnboard(true);
    }
  }, [metricData]);

  console.log("segments", segments);

  const handleChartOfAccountsFile = async (e) => {
    // Excel File
    const file = e.target.files[0];
    setFileName(file.name);
    // Formatted Data
    const workbookData = await ReadWorkbook(file);
    // Checks if the workbookData is valid
    const output = isChartOfAccountWorkBookDataValid(workbookData);
    if (output.valid) {
      // Create the Segments from the Formatted Data
      for (const [index, sheet] of workbookData.sheets.entries()) {
        const description = sheet.name;
        const chartFieldOrder = index;
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

        setSegments((segments) => [
          ...segments,
          { description, subSegments, chartFieldOrder },
        ]);
      }
      // Clears the Input field, in case the user wanted to upload a new file right away
      setChartOfAccountsFileInputKey(new Date());
    } else {
      // Displays an alert to the user and an error message why the chart of the accounts isn't valid
      alert(output.err);
    }
  };

  const handleMetricFile = async (e) => {
    // Excel File
    const file = e.target.files[0];
    setMetricFileName(file.name);
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
        return alert("No segments are detected, check file and upload again");
      }
      setMetricData((metricData) => {
        // If the metric data uploaded is already being worked with replace it with new file
        if (metricData.map((m) => m.name).includes(rawMetricData.name)) {
          return metricData.map((data) => {
            if (data.name === rawMetricData.name) {
              return {
                ...rawMetricData,
                validMethods: [],
                metricSegments: rawMetricData.columns.filter((column) =>
                  possibleAllocationSegmentNames.includes(column)
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
              possibleAllocationSegmentNames.includes(column)
            ),
          },
        ];
      });
    }
    // Clear metric upload file input
    setMetricFileInputKey(new Date());
    // Show onboarding panel
    // setShowMetricOnboard(true);
  };

  const handleSelectAll = (metricName) => {
    setMetricData((metricData) =>
      metricData.map((metric) => {
        const allValidMethods = metric.columns.filter(
          (column) => !metric.metricSegments.includes(column)
        );

        if (metric.name === metricName) {
          if (metric.validMethods.length < allValidMethods.length) {
            // Add the metric name to the validMethods array if the name was checked
            return {
              ...metric,
              validMethods: [...allValidMethods],
            };
          }
          // Remove the metric name from the validMethods array if the name was unchecked
          return {
            ...metric,
            validMethods: [],
          };
        }
        return metric;
      })
    );
  };

  const handleMetricChecked = (e, metricName, metricColumn) => {
    const checked = e.target.checked;

    setMetricData((metricData) =>
      metricData.map((metric) => {
        if (metric.name === metricName) {
          if (checked) {
            // Add the metric name to the validMethods array if the name was checked
            return {
              ...metric,
              validMethods: [...metric.validMethods, metricColumn],
            };
          }
          // Remove the metric name from the validMethods array if the name was unchecked
          return {
            ...metric,
            validMethods: metric.validMethods.filter(
              (vm) => vm !== metricColumn
            ),
          };
        }
        return metric;
      })
    );
  };

  const handleCancelMetric = (metricName) => {
    // Removes the saved metric from the react hook state
    setMetricData((metricData) =>
      metricData.filter((metric) => metric.name !== metricName)
    );
  };

  const handleCloseOnboardingPanel = () => {
    // Removes all working metric data
    setMetricData([]);
  };

  const handleSaveMetric = (metricName) => {
    // TODO: Figure out logic for what "save metric" does and don't show the show metrics button until it's "saved"
    // Find the completed metric from the working data
    const completedMetricData = metricData.find(
      (metric) => metric.name === metricName
    );
    setLoading(true);
    // Saves the metric to the chart of accounts
    Meteor.call(
      "chartOfAccounts.metrics.insert",
      currentChartOfAccounts._id,
      completedMetricData,
      (err, res) => {
        if (err) {
          alert("Unable to save metric", err.reason);
        }
        setLoading(false);
      }
    );
    // Removes the saved metric from the react hook state
    setMetricData((metricData) =>
      metricData.filter((metric) => metric.name !== metricName)
    );
  };

  // TODO: Create function that create the chart of accounts in DB using the segments and metrics when the final button is click

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!user.admin) {
    return <Redirect to="/" />;
  }

  return (
    <div style={{ height: "100vh", backgroundColor: "#F1F5F7" }}>
      <Header />
      <div className="onboardPageContainer">
        <div className="onboardContainer">
          <div className="onboardHeaderContainer">
            <div className="onboardHeaderText">
              <span
                className={
                  importPage === "segments"
                    ? "onboardHeaderActive"
                    : "onboardHeaderNotActive"
                }
                onClick={() => setImportPage("segments")}
              >
                Import Chart of Accounts
              </span>
              <ChevronRightIcon className="onboardHeaderArrow" />
              <span
                className={
                  importPage === "segments"
                    ? "onboardHeaderNotActive"
                    : "onboardHeaderActive"
                }
                onClick={() =>
                  segments.length > 0 ? setImportPage("metrics") : null
                }
              >
                Import Metrics
              </span>
            </div>
          </div>
          {importPage === "segments" ? (
            // ### SEGMENT PAGE ###
            <div className="onboardInnerContainer">
              <div className="onboardTitle">Upload a Chart of Accounts</div>
              <label htmlFor="file-upload" className="onboardFileInput">
                <span>Choose File</span>
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".xls,.xlsx"
                onChange={handleChartOfAccountsFile}
                key={chartOfAccountsFileInputKey}
              />
              <BarLoader loading={loading} color={BLUE} />
              <div className="onboardFileName">{fileName}</div>
              {segments.length > 0 ? (
                <button
                  onClick={() =>
                    setShowSegments((showSegments) => !showSegments)
                  }
                  className="onboardShowSegmentsButton"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {showSegments ? "Hide" : "Show"} Segments{" "}
                    {showSegments ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </div>
                </button>
              ) : null}
              {showSegments && segments.length > 0 ? (
                <div className="onboardSegmentsContainer">
                  <div className="onboardTitle">Segments:</div>
                  <div className="onboardSegmentsInnerContainer">
                    {segments.map((segment, index) => {
                      return (
                        <div key={index}>
                          <div className="segmentTitle">
                            {segment.description}
                          </div>
                          <ul style={{ paddingLeft: 18, paddingRight: 10 }}>
                            {segment.subSegments.map((subSegment, i) => (
                              <li key={i} className="onboardSubsegmentTitle">
                                {subSegment.segmentId} -{" "}
                                {subSegment.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {segments.length > 0 ? (
                <button
                  className="onboardNextButton"
                  onClick={() => setImportPage("metrics")}
                >
                  Next
                </button>
              ) : null}
            </div>
          ) : (
            // ### METRICS PAGE ###
            <div className="onboardInnerContainer">
              <div className="onboardTitle">Upload Metrics</div>
              <label htmlFor="file-upload" className="onboardFileInput">
                <span>Choose File</span>
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".xls,.xlsx"
                onChange={handleMetricFile}
                key={metricFileInputKey}
              />
              <BarLoader loading={loading} color={BLUE} />
              <div className="onboardFileName">{metricFileName}</div>
              {metricData.length > 0 ? (
                <button
                  onClick={() => setShowMetrics((showMetrics) => !showMetrics)}
                  className="onboardShowSegmentsButton"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {showMetrics ? "Hide" : "Show"} Metrics{" "}
                    {showMetrics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </div>
                </button>
              ) : null}

              {showMetrics && metricData.length > 0 ? (
                <div className="onboardSegmentsContainer">
                  <div className="onboardTitle">Metrics:</div>
                  <div className="onboardSegmentsInnerContainer">
                    {metricData.map((metric, index) => {
                      return (
                        <div key={index} style={{ marginLeft: 20 }}>
                          <div className="segmentTitle">
                            {metric.description}
                          </div>
                          <ul style={{ paddingLeft: 18, paddingRight: 10 }}>
                            {metric.metricSegments.map((segment, i) => (
                              <li key={i} className="onboardSubsegmentTitle">
                                {segment}
                              </li>
                            ))}
                          </ul>
                          <div className="segmentTitle">Allocation Methods</div>
                          <ul style={{ paddingLeft: 18, paddingRight: 10 }}>
                            {metric.validMethods.map((method, i) => (
                              <li key={i} className="onboardSubsegmentTitle">
                                {method}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {metricData.length > 0 ? (
                <button
                  className="onboardNextButton"
                  onClick={() => history.push("/")}
                >
                  Auto Allocation
                </button>
              ) : null}

              {/* Metrics Onboard Panel */}
              {showMetricOnboard ? (
                <div className="onboardMetricOnboardContainer">
                  <div className="onboardMetricOnboardHeaderContainer">
                    <div className="onboardTitle" style={{ marginTop: 0 }}>
                      Metric Onboarding
                    </div>
                    <IconButton
                      onClick={handleCloseOnboardingPanel}
                      color="inherit"
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                  {metricData.map((data, index) => (
                    <div
                      className="onboardMetricOnboardInnerContainer"
                      key={index}
                    >
                      <div className="onboardMetricOnboardTitle">
                        {data.name}
                      </div>
                      <div className="onboardMetricOnboardText">
                        Segments that can be used in allocations
                      </div>
                      <ul>
                        {data.columns.map((column, i) => {
                          if (possibleAllocationSegmentNames.includes(column)) {
                            return (
                              <li
                                key={i}
                                style={{ fontWeight: "bold" }}
                                key={i}
                              >
                                {column}
                              </li>
                            );
                          }
                        })}
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
                                  (column) =>
                                    !data.metricSegments.includes(column)
                                ).length
                                  ? "Unselect All"
                                  : "Select All"}
                              </label>
                            </button>
                          </div>
                        </div>
                        {data.columns.map((column, i) => {
                          // Exclude any columns that match possible allocation segment names
                          if (
                            !possibleAllocationSegmentNames.includes(column)
                          ) {
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
                        })}
                      </div>
                      <div>
                        <button
                          onClick={() => handleSaveMetric(data.name)}
                          className={`onboardMetricOnboardButton ${
                            metricData[metricData.length - 1].validMethods
                              .length === 0
                              ? "buttonDisabled"
                              : ""
                          }`}
                          disabled={
                            metricData[metricData.length - 1].validMethods
                              .length === 0
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
                          onClick={() => handleCancelMetric(data.name)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
