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
      <div className="formColumn">
        <label className="journalFormText">{description}</label>
        <select
          value={data.subSegments.findIndex(
            (subSegment) => subSegment.segmentId === selectedSegment.segmentId
          )}
          onChange={handleChangeSegment}
          className="journalFormInput"
          style={{ width: "10em" }}
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
      <div className="formColumn">
        <label className="journalFormText">Segment ID:</label>
        <div>{selectedSegment.segmentId}</div>
      </div>
    </div>
  );
};
