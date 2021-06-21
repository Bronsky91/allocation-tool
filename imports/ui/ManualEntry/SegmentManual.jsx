import React, { useState } from "react";

export const SegmentManual = ({
  data,
  handleChangeFormData,
  handledSelectedSegments,
  segmentType,
}) => {
  const [selectedSegment, setSelectedSegment] = useState(data.subSegments[0]);
  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
    setSelectedSegment(newSelectedSegment);
    handledSelectedSegments(data._id, newSelectedSegment);
  };

  return (
    <div>
      <h3>{data.description}</h3>
      <div className="formRow">
        <label className="formLabel">Description:</label>
        <select
          value={data.subSegments.findIndex(
            (subSegment) => subSegment.segmentId === selectedSegment.segmentId
          )}
          onChange={handleChangeSegment}
        >
          {data.subSegments.map((subSegment, index) => {
            return (
              <option key={index} value={index}>
                {subSegment.description}
              </option>
            );
          })}
        </select>
      </div>
      <div className="formRow">
        <label className="formLabel">Segment ID:</label>
        <div>{selectedSegment.segmentId}</div>
      </div>
      {segmentType === "MAIN" ? (
        <div className="formRow">
          <label className="formLabel">Value:</label>
          <input
            type="text"
            onChange={(e) =>
              handleChangeFormData("mainSegmentValue", e.target.value)
            }
          />
        </div>
      ) : null}
    </div>
  );
};
