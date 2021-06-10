import React, { useState } from "react";

export const Segment = ({ data, handleChangeFormData }) => {
  const [selectedSegment, setSelectedSegment] = useState(data.subSegments[0]);

  const handleChangeSegment = (e) => {
    setSelectedSegment(data.subSegments[e.target.value]);
  };

  return (
    <div>
      <h3>{data.description}</h3>
      <div className="formRow">
        <label className="formLabel">Description:</label>
        <select onChange={handleChangeSegment}>
          {data.subSegments.map((subSegment, index) => {
            return (
              <option key={index} value={index}>
                {subSegment.title}
              </option>
            );
          })}
        </select>
      </div>
      <div className="formRow">
        <label className="formLabel">Number:</label>
        <div>{selectedSegment.number}</div>
      </div>
      {data.isMain ? (
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
