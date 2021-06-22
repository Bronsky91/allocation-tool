import React, { useEffect } from "react";
import { useState } from "react";
import MultiSelect from "react-multi-select-component";

export const SubsegmentDropdown = ({
  segment,
  description,
  setSubsegmentsComplete,
}) => {
  const [selected, setSelected] = useState([]);
  // Creates the options object for the dropdown
  const options = segment?.subSegments.map((s) => ({
    label: s.description,
    value: s.segmentId,
  }));

  useEffect(() => {
    // TODO: This isn't working as expected
    if (selected.length > 0) {
      setSubsegmentsComplete((subsegmentsComplete) => {
        if (!subsegmentsComplete.includes(segment._id)) {
          return [...subsegmentsComplete, segment._id];
        } else {
          return subsegmentsComplete;
        }
      });
    } else {
      setSubsegmentsComplete((subsegmentsComplete) =>
        subsegmentsComplete.filter((s) => s === segment._id)
      );
    }
  }, [selected]);

  return (
    <div className="column" style={{ width: 200 }}>
      <h3>Which {description} to include</h3>
      <MultiSelect
        options={options}
        value={selected}
        onChange={setSelected}
        labelledBy="Select"
      />
    </div>
  );
};
