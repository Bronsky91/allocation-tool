import React, { useState } from "react";

export const OtherSegment = ({
  data,
  handleChangeOtherSegments,
  segmentType,
}) => {
  const [selectedSegment, setSelectedSegment] = useState(data.subSegments[0]);
  const [otherSegmentChecked, setOtherSegmentChecked] = useState(false);
  const description =
    segmentType !== "other"
      ? segmentType === "toAllocate"
        ? "GL Code to Allocate"
        : "GL Code to Balance"
      : data.description;

  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
    setSelectedSegment(newSelectedSegment);

    handleChangeOtherSegments(
      data._id,
      "selectedSubSegment",
      newSelectedSegment
    );
  };

  const handleOtherChecked = (e) => {
    setOtherSegmentChecked(e.target.checked);
    handleChangeOtherSegments(data._id, "isApplied", e.target.checked);
  };

  return (
    <div>
      <h3>{description}</h3>
      <div>
        <input
          type="checkbox"
          onChange={handleOtherChecked}
          checked={otherSegmentChecked}
        />
        <label>Applies to GL Balance?</label>
      </div>
      {otherSegmentChecked ? (
        <div>
          <div className="formRow">
            <label className="formLabel">Description:</label>
            <select
              value={data.subSegments.findIndex(
                (subSegment) =>
                  subSegment.segmentId === selectedSegment.segmentId
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
      ) : null}
    </div>
  );
};
