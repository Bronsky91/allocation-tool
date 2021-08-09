import React, { useState, useEffect } from "react";
// Material UI
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";

export const SubGLSegment = ({
  data,
  handleChangeFormData,
  showSubGLSegment,
  setShowSubGLSegment,
  selectedOption,
  setSelectedOption,
}) => {
  const [selectedSegment, setSelectedSegment] = useState(data.subSegments[0]);

  const description = data.description;
  const noSubGL = data.subSegments.find((s) => Number(s.segmentId) === 0);

  const handleChangeSegment = (e) => {
    const newSelectedSegment = data.subSegments[e.target.value];
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
              <label className="formLabel">Description:</label>
              <select
                value={data.subSegments.findIndex(
                  (subSegment) =>
                    subSegment.segmentId === selectedSegment.segmentId
                )}
                onChange={handleChangeSegment}
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
              <label className="formLabel">Segment ID:</label>
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
              className="formRow"
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
