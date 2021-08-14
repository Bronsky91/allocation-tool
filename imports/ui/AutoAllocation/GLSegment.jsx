import React, { useState } from "react";
import { useEffect } from "react";

export const GLSegment = ({
  glCodeSegment,
  formData,
  handleChangeFormData,
}) => {
  const handleChangeSegment = (e) => {
    const newSelectedSegment = glCodeSegment.subSegments[e.target.value];
    if (newSelectedSegment.typicalBalance) {
      // If there's a typical balance assigned to the new subsegment, auto choose it as default
      handleChangeFormData(
        "typicalBalance",
        newSelectedSegment.typicalBalance.toLowerCase()
      );
    }
    handleChangeFormData("selectedAllocationSegment", newSelectedSegment);
  };

  const handleChangeTypicalBalance = (e) => {
    handleChangeFormData("typicalBalance", e.target.value);
  };

  return (
    <div>
      <div className="journalFormTitle">GL Code to Allocate</div>

      <div className="formRow">
        <div className="formColumn">
          <label className="journalFormText">Description:</label>
          <select
            value={glCodeSegment.subSegments.findIndex(
              (subSegment) =>
                subSegment.segmentId ===
                formData.selectedAllocationSegment.segmentId
            )}
            onChange={handleChangeSegment}
            className="journalFormInput"
          >
            {glCodeSegment.subSegments.map((subSegment, index) => {
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
          <div>{formData.selectedAllocationSegment.segmentId}</div>
        </div>
        <div className="formColumn">
          <label className="journalFormText">Typical Balance:</label>
          <select
            className="journalFormInput"
            onChange={handleChangeTypicalBalance}
            value={formData.typicalBalance}
          >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
      </div>
    </div>
  );
};
