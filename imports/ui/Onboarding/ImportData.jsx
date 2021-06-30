import React, { useEffect, useState } from "react";
import { ReadWorkbook } from "../../api/ReadWorkbook";
import { useTracker } from "meteor/react-meteor-data";
import { CreateSegments, SegmentsCollection } from "../../api/Segments";
import { CreateMetrics, MetricsCollection } from "../../api/Metrics";

export const ImportData = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
  const metrics = useTracker(() => MetricsCollection.find().fetch());
  const [hideSegments, setHideSegments] = useState(false);
  const [hideMetrics, setHideMetrics] = useState(false);

  const handleChartOfAccountsFile = async (e) => {
    const file = e.target.files[0];
    const data = await ReadWorkbook(file);
    CreateSegments(data);
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
        <input type="file" onChange={handleChartOfAccountsFile}></input>
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
            {/* One table per sheet */}
            {segments.map((segment, index) => {
              return (
                <div key={index}>
                  <h3>{segment.description}</h3>
                  {/* // TODO: Since order of the object is no longer guarenteed, fix the column and row order to match everytime */}
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(segment.subSegments[0]).map(
                          (column, index) => (
                            <th key={index}>{column}</th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {segment.subSegments.map((subSegment, index) => (
                        <tr key={index}>
                          <td>{subSegment.segmentId}</td>
                          <td>{subSegment.description}</td>
                          <td>{subSegment.category}</td>
                          <td>{subSegment.typicalBalance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ) : null}

        <h2>Import Metric: </h2>
        <input type="file" onChange={handleMetricFile}></input>
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
