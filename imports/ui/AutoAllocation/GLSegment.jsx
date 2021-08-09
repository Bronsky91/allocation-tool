import React, { useState } from "react";
import { useEffect } from "react";

export const GLSegment = ({ data, handleChangeFormData }) => {
  const [selectedSegment, setSelectedSegment] = useState(data?.subSegments[0]);
  const [typicalBalance, setTypicalBalance] = useState("debit");

  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
    if (newSelectedSegment.typicalBalance) {
      // If there's a typical balance assigned to the new subsegment, auto choose it as default
      setTypicalBalance(newSelectedSegment.typicalBalance.toLowerCase());
    }
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
      <div className="journalFormTitle">GL Code to Allocate</div>

      <div className="formRow">
        <div className="formColumn">
          <label className="journalFormText">Description:</label>
          <select
            value={data.subSegments.findIndex(
              (subSegment) => subSegment.segmentId === selectedSegment.segmentId
            )}
            onChange={handleChangeSegment}
            style={{ width: 200 }}
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
        <div className="formColumn">
          <label className="journalFormText">Typical Balance:</label>
          <select onChange={handleChangeTypicalBalance} value={typicalBalance}>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
      </div>
    </div>
  );
};
