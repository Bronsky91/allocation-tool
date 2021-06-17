import React, { useState } from "react";
import { ReadWorkbook } from "../api/ReadWorkbook";
import { useTracker } from "meteor/react-meteor-data";
import { COLUMNS, CreateSegments, SegmentsCollection } from "../api/Segments";

export const ImportData = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await ReadWorkbook(file);
    CreateSegments(data);
  };

  return (
    <div>
      <input type="file" onChange={handleFile}></input>
      {segments.length > 0 ? (
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
    </div>
  );
};
