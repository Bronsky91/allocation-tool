import React, { useState } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Utils
import { ReadWorkbook } from "../../utils/ReadWorkbook";
import { isChartOfAccountWorkBookDataValid } from "../../utils/CheckWorkbookData";
// DB
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { MetricsCollection } from "../../db/MetricsCollection";
// Constants
import { GL_CODE, SUB_GL_CODE } from "../../../constants";
import { Header } from "../Header";
import { useHistory } from "react-router-dom";
// Material UI
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

export const ImportData = () => {
  // Subscriptions
  Meteor.subscribe("segments");
  Meteor.subscribe("metrics");

  // Current user logged in
  const user = useTracker(() => Meteor.user());

  const history = useHistory();

  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user?._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user?._id }).fetch()
  );
  // metricData is uploaded metrics sheets and worked data before saving
  const [fileName, setFileName] = useState("");
  const [metricFileName, setMetricFileName] = useState("");
  const [importPage, setImportPage] = useState("segments");
  const [metricData, setMetricData] = useState([]);
  const [showSegments, setShowSegments] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showMetricOnboard, setShowMetricOnboard] = useState(false);
  const [chartOfAccountsFileInputKey, setChartOfAccountsFileInputKey] =
    useState(new Date());
  const [metricFileInputKey, setMetricFileInputKey] = useState(new Date());

  // Segments possible for allocation
  const possibleAllocationSegmentNames = segments
    .filter((segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description))
    .map((segment) => segment.description);

  const handleChartOfAccountsFile = async (e) => {
    // Excel File
    const file = e.target.files[0];
    setFileName(file.name);
    // Formatted Data
    const workbookData = await ReadWorkbook(file);
    // Checks if the workbookData is valid
    const output = isChartOfAccountWorkBookDataValid(workbookData);
    if (output.valid) {
      // If their are currently segments
      if (segments.length > 0) {
        // TODO: User alert before deleting previous segments
        // then remove the previous segment collection
        Meteor.call("segment.removeAll", {}, (err, res) => {
          if (err) {
            // TODO: User alert of errors in the uploaded workbookData
            console.log("Error Deleting Segments", err);
            alert(err);
          } else {
            console.log("Deleted All Segments", res);
            // Create the Segments from the Formatted workbookData now that the old segments are deleted
            Meteor.call("segment.insert", workbookData);
            // Clears the Input field, in case the user wanted to upload a new file right away
            setChartOfAccountsFileInputKey(new Date());
          }
        });
      } else {
        // Create the Segments from the Formatted Data if there are no segments currently
        Meteor.call("segment.insert", workbookData);
        // Clears the Input field, in case the user wanted to upload a new file right away
        setChartOfAccountsFileInputKey(new Date());
      }
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
    // Show Metric Onboarding Page
    setShowMetricOnboard(true);
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

  const handleSaveMetric = (metricName) => {
    // Find the completed metric from the working data
    const completedMetricData = metricData.find(
      (metric) => metric.name === metricName
    );
    // Saves the metric to the database
    Meteor.call("metric.insert", completedMetricData);
    // Removes the saved metric from the react hook state
    setMetricData((metricData) =>
      metricData.filter((metric) => metric.name !== metricName)
    );
    setShowMetricOnboard(false);
  };

  if (!user) {
    return <Redirect to="/login" />;
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
                onClick={() => setImportPage("metrics")}
              >
                Import Metrics
              </span>
            </div>
          </div>
          {importPage === "segments" ? (
            // ### SEGMENT PAGE ###
            <div className="onboardInnerContainer">
              <div className="onboardTitle">Upload the Chart of Accounts</div>
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
              <div className="onboardFileName">{metricFileName}</div>
              {metrics.length > 0 ? (
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

              {showMetrics && metrics.length > 0 ? (
                <div className="onboardSegmentsContainer">
                  <div className="onboardTitle">Metrics:</div>
                  <div className="onboardSegmentsInnerContainer">
                    {metrics.map((metric, index) => {
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
              {metrics.length > 0 ? (
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
                    <div className="onboardTitle">Metric Onboarding</div>
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
                                />
                                <label style={{ fontWeight: "bold" }}>
                                  {column}
                                </label>
                              </div>
                            );
                          }
                        })}
                      </div>
                      {metricData[metricData.length - 1].validMethods.length >
                      0 ? (
                        <button
                          onClick={() => handleSaveMetric(data.name)}
                          className="onboardMetricOnboardButton"
                        >
                          Save Metric
                        </button>
                      ) : null}
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
