import React from "react";
import { SegmentSelect } from "./SegmentSelect";
import Select from "react-select";
import { customSelectStyles } from "../../../constants";

export const GLSegment = ({
  glCodeSegment,
  formData,
  handleChangeFormData,
}) => {
  const typicalBalanceOptions = [
    { label: "Credit", value: "credit" },
    { label: "Debit", value: "debit" },
  ];

  const handleChangeSegment = (selected) => {
    const newSelectedSegment = glCodeSegment.subSegments[selected.value];
    if (newSelectedSegment.typicalBalance) {
      // If there's a typical balance assigned to the new subsegment, auto choose it as default
      handleChangeFormData(
        "typicalBalance",
        newSelectedSegment.typicalBalance.toLowerCase()
      );
    }
    handleChangeFormData("selectedAllocationSegment", newSelectedSegment);
  };

  const handleChangeTypicalBalance = (selected) => {
    handleChangeFormData("typicalBalance", selected.value);
  };

  return (
    <div>
      <div className="journalFormTitle">GL Code to Allocate</div>

      <div className="formRow">
        <div className="formColumn">
          <label className="journalFormText">Description:</label>
          <SegmentSelect
            value={glCodeSegment.subSegments.findIndex(
              (subSegment) =>
                subSegment.segmentId ===
                formData.selectedAllocationSegment.segmentId
            )}
            onChange={handleChangeSegment}
            subSegments={glCodeSegment.subSegments}
            menuPlacement="top"
          />
        </div>
        <div className="formColumn">
          <label className="journalFormText">Segment ID:</label>
          <div>{formData.selectedAllocationSegment.segmentId}</div>
        </div>
        <div className="formColumn">
          <label className="journalFormText">Typical Balance:</label>
          <Select
            className="journalFormInputSelect"
            onChange={handleChangeTypicalBalance}
            value={
              typicalBalanceOptions.find(
                (tb) => tb.value === formData.typicalBalance
              ) || null
            }
            options={typicalBalanceOptions}
            styles={customSelectStyles}
          />
        </div>
      </div>
    </div>
  );
};
