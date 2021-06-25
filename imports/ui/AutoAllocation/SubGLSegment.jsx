import React, { useState } from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { useEffect } from "react";

export const SubGLSegment = ({ data, handleChangeFormData }) => {
  const [selectedSegment, setSelectedSegment] = useState(data.subSegments[0]);
  const [showSubGLSegment, setShowSubGLSegment] = useState(false);
  const [selectedOption, setSelectedOption] = useState("balance");

  const description = data.description;
  const noSubGL = { description: "None", segmentId: "0000" };

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
        <label style={{ fontWeight: "bold" }}>
          Would you like to select a Sub GL Code?
        </label>
      </div>
      {showSubGLSegment ? (
        <div>
          <h3>{description}</h3>
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
          <FormControl component="fieldset">
            <RadioGroup
              name="sub-account"
              value={selectedOption}
              onChange={handleOptionChange}
              defaultValue="balance"
              defaultChecked="balance"
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
