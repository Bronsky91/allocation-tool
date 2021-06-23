import React, { useState } from "react";
import { useEffect } from "react";

export const GLSegment = ({ data, handleChangeFormData, segmentType }) => {
  const [selectedSegment, setSelectedSegment] = useState(data?.subSegments[0]);
  const [typicalBalance, setTypicalBalance] = useState("debit");
  const description =
    segmentType === "toAllocate" ? "GL Code to Allocate" : "GL Code to Balance";

  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
    setSelectedSegment(newSelectedSegment);
  };

  const handleChangeTypicalBalance = (e) => {
    setTypicalBalance(e.target.value);
  };

  useEffect(() => {
    const field =
      segmentType === "toAllocate"
        ? "selectedAllocationSegment"
        : "selectedBalanceSegment";
    handleChangeFormData(field, selectedSegment);
    if (segmentType === "toAllocate")
      handleChangeFormData("typicalBalance", typicalBalance);
  }, [selectedSegment, typicalBalance]);

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
          {/* //TODO: Make sure no negative number can be entered */}
          <input
            type="number"
            onChange={(e) =>
              handleChangeFormData(
                "toBalanceSegmentValue",
                Number(e.target.value)
              )
            }
          />
        </div>
      ) : null}
      {segmentType === "toAllocate" ? (
        <div>
          <label>Typical Balance:</label>
          <select onChange={handleChangeTypicalBalance} value={typicalBalance}>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
      ) : null}
    </div>
  );
};
