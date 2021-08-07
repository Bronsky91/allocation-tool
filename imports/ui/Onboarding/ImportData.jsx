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
import { Redirect } from "react-router-dom";
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

  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user?._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user?._id }).fetch()
  );
  // metricData is uploaded metrics sheets and worked data before saving
  const [fileName, setFileName] = useState("");
  const [metricFileNames, setMetricFileNames] = useState([]);
  const [metricData, setMetricData] = useState([]);
  const [hideSegments, setHideSegments] = useState(false);
  const [chartOfAccountsFileInputKey, setChartOfAccountsFileInputKey] =
    useState(new Date());
  const [metricFileInputKey, setMetricFileInputKey] = useState(new Date());

  // Segments possible for allocation
  const possibleAllocationSegmentNames = segments
    .filter((segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description))
    .map((segment) => segment.description);

  const handleChartOfAccountsFile = async (e) => {
    // Excel/CSV File
    const file = e.target.files[0];
    setFileName(file.name);
    // Formatted Data
    const workbookData = await ReadWorkbook(file);

    // If their are currently segments
    if (segments.length > 0) {
      // TODO: User alert before deleting previous segments
      // and the workbookData is good
      if (isChartOfAccountWorkBookDataValid(workbookData)) {
        // then remove the previous segment collection
        Meteor.call("segment.removeAll", {}, (err, res) => {
          if (err) {
            // TODO: User alert of errors in the uploaded workbookData
            console.log("Error Deleting Segments", err);
          } else {
            console.log("Deleted All Segments", res);
            // Create the Segments from the Formatted workbookData now that the old segments are deleted
            Meteor.call("segment.insert", workbookData);
          }
        });
      } else {
        // TODO: User alert of errors in the uploaded data
      }
    } else {
      // Create the Segments from the Formatted Data if there are no segments currently
      Meteor.call("segment.insert", workbookData);
    }
    // Clears the Input field, in case the user wanted to upload a new file right away
    setChartOfAccountsFileInputKey(new Date());
  };

  const handleMetricFile = async (e) => {
    const file = e.target.files[0];
    const data = await ReadWorkbook(file);
    if (data && "sheets" in data && data.sheets.length > 0) {
      const rawMetricData = data.sheets[0];
      // TODO: This could probably be refactored a bit to be cleaner
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
              <span className="onboardHeaderActive">
                Import Chart of Accounts
              </span>
              <ChevronRightIcon className="onboardHeaderArrow" />
              <span className="onboardHeaderNotActive">Import Metrics</span>
            </div>
          </div>
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
                onClick={() => setHideSegments((hideSegments) => !hideSegments)}
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
                  {hideSegments ? "Hide" : "Show"} Segments{" "}
                  {hideSegments ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </div>
              </button>
            ) : null}
            {hideSegments && segments.length > 0 ? (
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
            <button className="onboardNextButton">Next</button>
            {/* {segments.length > 0 ? (
              <div>
                <h2>Import Metric: </h2>
                <input
                  type="file"
                  onChange={handleMetricFile}
                  key={metricFileInputKey}
                ></input>
              </div>
            ) : null}
            {metrics.map((metric, index) => (
              <div key={index}>
                <h3>{metric.description}</h3>
                <div>Allocation Segments</div>
                <ul>
                  {metric.metricSegments.map((segment, i) => (
                    <li key={i}>{segment}</li>
                  ))}
                </ul>
                <div>Allocation Methods</div>
                <ul>
                  {metric.validMethods.map((method, i) => (
                    <li key={i}>{method}</li>
                  ))}
                </ul>
              </div>
            ))} */}
          </div>
          {/* <div>
            <h2>Onboarding</h2>
            {metricData.map((data, index) => (
              <div key={index}>
                <h3 style={{ textDecoration: "underline" }}>{data.name}</h3>
                <h3 style={{ fontWeight: "normal" }}>
                  Segments that can be used in allocations
                </h3>
                <ul>
                  {data.columns.map((column, i) => {
                    if (possibleAllocationSegmentNames.includes(column)) {
                      return (
                        <li key={i} style={{ fontWeight: "bold" }} key={i}>
                          {column}
                        </li>
                      );
                    }
                  })}
                </ul>
                <h3 style={{ fontWeight: "normal" }}>
                  Select methods that will be used for allocations
                </h3>

                {data.columns.map((column, i) => {
                  // Exclude any columns that match possible allocation segment names
                  if (!possibleAllocationSegmentNames.includes(column)) {
                    return (
                      <div key={i}>
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            handleMetricChecked(e, data.name, column)
                          }
                          value={column}
                        />
                        <label style={{ fontWeight: "bold" }}>{column}</label>
                      </div>
                    );
                  }
                })}
                <button
                  onClick={() => handleSaveMetric(data.name)}
                  style={{ padding: 5, marginTop: "1em" }}
                >
                  Save Metric
                </button>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};
