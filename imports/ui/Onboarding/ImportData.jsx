import React, { useEffect, useState } from "react";
import { ReadWorkbook } from "../../api/ReadWorkbook";
import { useTracker } from "meteor/react-meteor-data";

import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";

import { CreateSegments, SegmentsCollection } from "../../api/Segments-Change";
import { CreateMetrics, MetricsCollection } from "../../api/Metrics";
import { isChartOfAccountWorkBookDataValid } from "../../api/utils/CheckWorkbookData";

export const ImportData = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
  const metrics = useTracker(() => MetricsCollection.find().fetch());
  const [hideSegments, setHideSegments] = useState(false);
  const [chartOfAccountsFileInputKey, setChartOfAccountsFileInputKey] =
    useState(new Date());

  const handleChartOfAccountsFile = async (e) => {
    // Excel/CSV File
    const file = e.target.files[0];
    // Formatted Data
    const data = await ReadWorkbook(file);
    // If their are currently segments
    if (segments.length > 0) {
      // TODO: User alert before deleting previous segments
      // and the data is good
      if (isChartOfAccountWorkBookDataValid(data)) {
        // then remove the previous segment collection
        Meteor.call("removeAllSegments", {}, (err, res) => {
          if (err) {
            // TODO: User alert of errors in the uploaded data
            console.log("Error Deleting Segments", err);
          } else {
            console.log("Deleted All Segments", res);
            // Create the Segments from the Formatted Data now that the old segments are deleted
            CreateSegments(data);
          }
        });
      } else {
        // TODO: User alert of errors in the uploaded data
      }
    } else {
      // Create the Segments from the Formatted Data if there are no segments currently
      CreateSegments(data);
    }
    // Clears the Input field, in case the user wanted to upload a new file right away
    setChartOfAccountsFileInputKey(new Date());
  };

  const handleMetricFile = async (e) => {
    const file = e.target.files[0];
    const data = await ReadWorkbook(file);
    console.log("import Data", data);
    CreateMetrics(data);
  };

  if (metrics.length > 0) {
    console.log("metrics", metrics);
  }

  return (
    <div className="importDataContainer">
      <div>
        <h2>Import Chart of Accounts: </h2>
        <input
          type="file"
          onChange={handleChartOfAccountsFile}
          key={chartOfAccountsFileInputKey}
        ></input>
        {segments.length > 0 ? (
          <button
            onClick={() => setHideSegments((hideSegments) => !hideSegments)}
          >
            {hideSegments ? "Hide" : "Show"} Segments
          </button>
        ) : null}
        {hideSegments && segments.length > 0 ? (
          <div>
            <h2>Segments:</h2>
            {segments.map((segment, index) => {
              return (
                <div key={index}>
                  <h3>{segment.description}</h3>
                  <ul>
                    {segment.subSegments.map((subSegment, i) => (
                      <li key={i}>{subSegment.description}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : null}
        {segments.length > 0 ? (
          <div>
            <h2>Import Metric: </h2>
            <input type="file" onChange={handleMetricFile}></input>
          </div>
        ) : null}
        {metrics.map((metric) => (
          <div>
            <h3>{metric.description}</h3>
            <ul>
              {metric.columns.map((column) => (
                <li>{column.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <h2>Onboarding</h2>
        <div>Add onboarding stuff here</div>
        <ul>
          <li>Selecting GL Code Segments from chart of accounts?</li>
          <li>Selecting what columns are segments in metric spreadsheet</li>
          <ul>
            <li>
              Confirm link between segments in chart of accounts and metric
            </li>
          </ul>
        </ul>
      </div>
    </div>
  );
};
