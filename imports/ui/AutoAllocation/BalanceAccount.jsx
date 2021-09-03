import React from "react";
// Utils
import { createBalanceAccountString } from "../../utils/CreateAccountStrings";
import { SegmentSelect } from "./SegmentSelect";

export const BalanceAccount = ({ handleChangeFormData, formData }) => {
  const handleChangeSegment = (selected, index) => {
    const newSelectedSubsegmentIndex = selected.value;

    handleChangeFormData(
      "selectedBalanceSegments",
      formData.selectedBalanceSegments.map((s, i) => {
        if (index === i) {
          return {
            ...s,
            selectedSubSegment: s.subSegments[newSelectedSubsegmentIndex],
          };
        }
        return s;
      })
    );
  };

  return (
    <div>
      <div className="journalFormTitle">Balancing Account</div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
        }}
      >
        <div className="formRow" style={{ justifyContent: "flex-start" }}>
          {formData.selectedBalanceSegments.map((segment, index) => {
            return (
              <div className="formColumn" key={index}>
                <label className="journalFormText">{segment.description}</label>
                <SegmentSelect
                  value={segment.subSegments.findIndex(
                    (subSegment) =>
                      subSegment.segmentId ===
                      formData.selectedBalanceSegments[index].selectedSubSegment
                        .segmentId
                  )}
                  onChange={(selected) => handleChangeSegment(selected, index)}
                  subSegments={segment.subSegments}
                />
              </div>
            );
          })}
        </div>
        <div className="formRow" style={{ justifyContent: "flex-start" }}>
          <div className="formColumn">
            <label className="journalFormText">Full Chart Field String:</label>
            <div>{createBalanceAccountString(formData)}</div>
          </div>
          <div className="formColumn" style={{ marginLeft: "1em" }}>
            <label className="journalFormText">Value:</label>
            <input
              type="number"
              onChange={(e) =>
                handleChangeFormData("toBalanceSegmentValue", e.target.value)
              }
              className="journalFormInput"
              style={{ width: "15em", height: "1.5em" }}
              value={formData.toBalanceSegmentValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
