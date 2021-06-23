import React, { useEffect } from "react";
import { useState } from "react";
import MultiSelect from "react-multi-select-component";

export const SubsegmentDropdown = ({
  segment,
  setSubsegmentFormData,
  isMultiSelect,
}) => {
  // Creates the options object for the dropdown
  const initialOptions = segment?.subSegments.map((s) => ({
    label: s.description,
    value: s.segmentId,
    disabled: false,
  }));
  const [options, setOptions] = useState(initialOptions);
  const [selected, setSelected] = useState([]);

  const handleSelect = (selectedOptions) => {
    if (!isMultiSelect) {
      // If not multi select dropdown after selection disable all other selections
      if (selectedOptions.length === 1) {
        // One option was selected, make all others disabled
        setOptions((options) =>
          options.map((option) => {
            if (option.value !== selectedOptions[0].value) {
              return { ...option, disabled: true };
            }
            return option;
          })
        );
      } else if (selectedOptions.length === 0) {
        // The one option was deselected, make all options enabled
        setOptions((options) =>
          options.map((option) => ({ ...option, disabled: false }))
        );
      }
    }
    setSelected(selectedOptions);
  };

  useEffect(() => {
    setSubsegmentFormData((data) => ({
      ...data,
      [segment.description]: selected.map((s) => s.value),
    }));
  }, [selected]);

  return (
    <div className="column" style={{ width: 200 }}>
      <h3>Which {segment.description} to include</h3>
      <MultiSelect
        hasSelectAll={isMultiSelect}
        options={options}
        value={selected}
        onChange={handleSelect}
        labelledBy="Select"
      />
    </div>
  );
};
