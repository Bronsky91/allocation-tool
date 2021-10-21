import React, { useState, useEffect } from "react";
// Material UI
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { SegmentSelect } from "./SegmentSelect";

export const SubGLSegment = ({
  subGLCodeSegment,
  formData,
  handleChangeFormData,
  selectedSegment,
  setSelectedSegment,
  showSubGLSegment,
  setShowSubGLSegment,
  selectedOption,
  setSelectedOption,
}) => {
  const noSubGL = subGLCodeSegment.subSegments.find(
    (s) => Number(s.segmentId) === 0
  );

  const formSelectedSubSegment =
    selectedOption !== "both"
      ? formData.subGLSegment[selectedOption]
      : formData.subGLSegment["balance"];

  const handleChangeSegment = (selected) => {
    const newSelectedSegment = subGLCodeSegment.subSegments[selected.value];
    setSelectedSegment(newSelectedSegment);
  };

  const handleChecked = (e) => {
    setShowSubGLSegment(e.target.checked);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  useEffect(() => {
    if (!showSubGLSegment) {
      handleChangeFormData("subGLSegment", {
        balance: noSubGL,
        allocations: noSubGL,
      });
    } else if (selectedOption === "both") {
      handleChangeFormData("subGLSegment", {
        balance: selectedSegment,
        allocations: selectedSegment,
      });
    } else if (selectedOption === "balance") {
      handleChangeFormData("subGLSegment", {
        balance: selectedSegment,
        allocations: noSubGL,
      });
    } else if (selectedOption === "allocations") {
      handleChangeFormData("subGLSegment", {
        balance: noSubGL,
        allocations: selectedSegment,
      });
    }
  }, [selectedSegment, selectedOption, showSubGLSegment]);

  return (
    <div style={{ marginTop: "2em" }}>
      <div>
        <input
          type="checkbox"
          onChange={handleChecked}
          checked={showSubGLSegment}
        />
        <label className="journalFormText">
          Would you like to select a Sub GL Code?
        </label>
      </div>
      {showSubGLSegment ? (
        <div className="journalSubGLContainer">
          <div className="journalFormTitle">Sub GL Code</div>
          <div className="formRow" style={{ justifyContent: "flex-start" }}>
            <div className="formColumn">
              <label className="journalFormText">Description:</label>
              <SegmentSelect
                value={subGLCodeSegment.subSegments.findIndex(
                  (subSegment) =>
                    subSegment.segmentId === formSelectedSubSegment.segmentId
                )}
                onChange={handleChangeSegment}
                subSegments={subGLCodeSegment.subSegments}
                menuPlacement="top"
              />
            </div>
            <div className="formColumn">
              <label className="journalFormText">Segment ID:</label>
              <div>{selectedSegment.segmentId}</div>
            </div>
          </div>
          <FormControl component="fieldset">
            <RadioGroup
              name="sub-account"
              value={selectedOption}
              onChange={handleOptionChange}
              defaultValue="balance"
              defaultChecked="balance"
              style={{ width: "100%", flexDirection: "row" }}
            >
              <FormControlLabel
                value="balance"
                control={<Radio color="primary" size="small" />}
                label="Balance"
              />
              <FormControlLabel
                value="allocations"
                control={<Radio color="primary" size="small" />}
                label="Allocations"
              />
              <FormControlLabel
                value="both"
                control={<Radio color="primary" size="small" />}
                label="Both"
              />
            </RadioGroup>
          </FormControl>
        </div>
      ) : null}
    </div>
  );
};
