import React, { useState } from "react";

export const GLSegment = ({ data, handleChangeFormData, segmentType }) => {
  const [selectedSegment, setSelectedSegment] = useState(data?.subSegments[0]);
  const description =
    segmentType === "toAllocate" ? "GL Code to Allocate" : "GL Code to Balance";

  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
    setSelectedSegment(newSelectedSegment);

    const field =
      segmentType === "toAllocate"
        ? "selectedAllocationSegment"
        : "selectedBalanceSegment";
    handleChangeFormData(field, newSelectedSegment);
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

      {segmentType === "toBalance" ? (
        <div className="formRow">
          <label className="formLabel">Value:</label>
          <input
            type="text"
            onChange={(e) =>
              handleChangeFormData("toBalanceSegmentValue", e.target.value)
            }
          />
        </div>
      ) : null}
    </div>
  );
};
