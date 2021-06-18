import React, { useEffect, useState } from "react";
import { ReadWorkbook } from "../api/ReadWorkbook";
import { useTracker } from "meteor/react-meteor-data";
import { COLUMNS, CreateSegments, SegmentsCollection } from "../api/Segments";

export const ImportData = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
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
  };

  return (
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
  );
};
