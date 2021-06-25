import React, { useState } from "react";
import { useEffect } from "react";

export const GLSegment = ({ data, handleChangeFormData }) => {
  const [selectedSegment, setSelectedSegment] = useState(data?.subSegments[0]);
  const [typicalBalance, setTypicalBalance] = useState("debit");

  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
    setSelectedSegment(newSelectedSegment);
  };

  const handleChangeTypicalBalance = (e) => {
    setTypicalBalance(e.target.value);
  };

  useEffect(() => {
    handleChangeFormData("selectedAllocationSegment", selectedSegment);
    handleChangeFormData("typicalBalance", typicalBalance);
  }, [selectedSegment, typicalBalance]);

  return (
    <div>
      <h3>GL Code to Allocate</h3>

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

      <div>
        <label>Typical Balance:</label>
        <select onChange={handleChangeTypicalBalance} value={typicalBalance}>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
      </div>
    </div>
  );
};
