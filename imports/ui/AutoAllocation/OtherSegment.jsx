import React, { useState } from "react";

export const OtherSegment = ({ data, handleChangeOtherSegments }) => {
  const [selectedSegment, setSelectedSegment] = useState(data.subSegments[0]);
  const description = data.description;

  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
    setSelectedSegment(newSelectedSegment);

    handleChangeOtherSegments(
      data._id,
      "selectedSubSegment",
      newSelectedSegment
    );
  };

  return (
    <div>
      <h3>{description}</h3>
      <div>
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
      </div>
    </div>
  );
};