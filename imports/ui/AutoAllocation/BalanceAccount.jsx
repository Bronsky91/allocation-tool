import React, { useState } from "react";
import { useEffect } from "react";

export const BalanceAccount = ({ data, handleChangeFormData, subGL }) => {
  const [selectedSegments, setSelectedSegments] = useState(
    data.map((s) => ({ ...s, selectedSubSegment: s.subSegments[0] }))
  );

  const handleChangeSegment = (e, index) => {
    const newSelectedSubsegmentIndex = e.target.value;
    setSelectedSegments((selectedSegments) =>
      selectedSegments.map((s, i) => {
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

  useEffect(() => {
    handleChangeFormData("selectedBalanceSegments", selectedSegments);
  }, [selectedSegments]);

  return (
    <div>
      <h3>Balancing Account</h3>

      <div>
        <div className="formRow">
          {selectedSegments.map((segment, index) => {
            return (
              <div className="column" key={index}>
                <label>{segment.description}</label>
                <select
                  style={{ maxWidth: "10em", marginTop: ".5em" }}
                  value={segment.subSegments.findIndex(
                    (subSegment) =>
                      subSegment.segmentId ===
                      selectedSegments[index].selectedSubSegment.segmentId
                  )}
                  onChange={(e) => handleChangeSegment(e, index)}
                >
                  {segment.subSegments.map((subSegment, index) => {
                    return (
                      <option key={index} value={index}>
                        {subSegment.description}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>
        <div className="formRow">
          <label className="formLabel">Full Chart Field String:</label>
          <div>
            {`${selectedSegments
              .map((s) => s.selectedSubSegment.segmentId)
              .join("-")}-${subGL.balance.segmentId}`}
          </div>
        </div>
      </div>

      <div className="formRow">
        <label className="formLabel">Value:</label>
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
    </div>
  );
};
