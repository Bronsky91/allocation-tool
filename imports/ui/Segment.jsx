import React, { useState } from "react";

export const Segment = ({
  data,
  handleChangeFormData,
  handledSelectedSegments,
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
            (subSegment) => subSegment.number === selectedSegment.number
          )}
          onChange={handleChangeSegment}
        >
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
      {data.type === "MAIN" ? (
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
