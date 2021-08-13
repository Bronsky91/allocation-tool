import React, { useEffect } from "react";
import { useState } from "react";
// Packages
import MultiSelect from "react-multi-select-component";

export const SubsegmentDropdown = ({
  segment,
  metric,
  subsegmentAllocationData,
  setSubsegmentAllocationData,
  isMultiSelect,
}) => {
  // Creates the options object for the dropdown
  const initialOptions = segment?.subSegments
    // Filters the subSegmentIds by if they're available in the currently selected metric or not
    .filter((subSegment) => {
      // Array of all the subsegment options available in the current metric
      const availableSubSegments = [
        ...new Set(
          metric.columns
            .find((c) => c.title === segment.description)
            .rows.map((row) => row.value.toString())
        ),
      ];
      return availableSubSegments.includes(subSegment.segmentId.toString());
    })
    .map((s) => ({
      label: s.description,
      value: s.segmentId,
      disabled: false,
    }));

  const initialSelected = subsegmentAllocationData
    ? segment?.subSegments
        .filter((s) =>
          subsegmentAllocationData[segment?.description].includes(s.segmentId)
        )
        .map((s) => ({
          label: s.description,
          value: s.segmentId,
          disabled: false,
        }))
    : [];
  const [options, setOptions] = useState(initialOptions);
  const [selected, setSelected] = useState(initialSelected);

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
    setSubsegmentAllocationData((data) => ({
      ...data,
      [segment.description]: selected.map((s) => s.value),
    }));
  }, [selected]);

  useEffect(() => {
    if (isMultiSelect) {
      // If muliselect is true enable all options
      setOptions((options) =>
        options.map((option) => ({ ...option, disabled: false }))
      );
    } else {
      // Else make all options disabled, except the options that are selected
      setOptions((options) => {
        return options.map((option) => {
          // If there are selected options and the option value is not included in an array of the selected value disable it
          if (
            selected.length > 0 &&
            !selected
              .map((selectedOption) => selectedOption.value)
              .includes(option.value)
          ) {
            return { ...option, disabled: true };
          }
          return option;
        });
      });
      // Also if there are more than one selection, remove all selection and make all options enabled
      if (selected.length > 1) {
        setSelected(() => []);
        setOptions((options) =>
          options.map((option) => ({ ...option, disabled: false }))
        );
      }
    }
  }, [isMultiSelect]);

  return (
    <div className="column">
      <div className="allocationText">
        Which {segment.description} to include?
      </div>
      <MultiSelect
        hasSelectAll={isMultiSelect}
        options={options}
        value={selected}
        onChange={handleSelect}
        labelledBy="Select"
        className="allocationSectionInput"
      />
    </div>
  );
};
