import React, { useEffect } from "react";
import { useState } from "react";
// Components
import { SASelect } from "./SASelect";

export const SubsegmentDropdown = ({
  segment,
  metric,
  subsegmentAllocationData,
  setSubsegmentAllocationData,
  isMultiSelect,
  scrollToBottom,
}) => {
  // Creates the options object for the dropdown
  const options = segment?.subSegments
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
      label: `${s.segmentId} - ${s.description}`,
      value: s.segmentId,
    }));

  const initialSelected = subsegmentAllocationData
    ? segment?.subSegments
        .filter((s) =>
          subsegmentAllocationData[segment?.description].includes(s.segmentId)
        )
        .map((s) => ({
          label: s.description,
          value: s.segmentId,
        }))
    : [];

  const [selected, setSelected] = useState(initialSelected);

  const handleSelect = (selectedOption) => {
    const selectedOptionArray = isMultiSelect
      ? [...selectedOption]
      : [selectedOption];

    setSelected(selectedOptionArray);
  };

  useEffect(() => {
    setSubsegmentAllocationData((data) => ({
      ...data,
      [segment.description]: selected.map((s) => s.value),
    }));
  }, [selected]);

  useEffect(() => {
    if (!isMultiSelect) {
      // If there are more than one selection, remove all selection and make all options enabled
      if (selected.length > 1) {
        setSelected([]);
      }
    }
  }, [isMultiSelect]);

  const customSelectStyles = {
    menu: (provided, state) => ({
      ...provided,
      paddingBottom: 15,
      borderRadius: null,
      boxShadow: null,
    }),
    menuList: (provided, state) => ({
      ...provided,
      borderRadius: "4px",
      boxShadow:
        "0 0 0 1px hsl(0deg 0% 0% / 10%), 0 4px 11px hsl(0deg 0% 0% / 10%)",
    }),
  };

  const multiValueContainer = ({ selectProps, data }) => {
    const label = data.label;
    const allSelected = selectProps.value;
    const index = allSelected.findIndex((selected) => selected.label === label);
    const isLastSelected = index === allSelected.length - 1 || index >= 5;
    const count =
      allSelected.length > 5 ? allSelected.length - 5 : allSelected.length - 1;
    const labelSuffix = isLastSelected ? ` and ${count} more...` : ", ";
    const val = index > 5 ? `` : `${index >= 5 ? "" : label}${labelSuffix}`;
    return val;
  };

  return (
    <div className="column">
      <div className="allocationText">
        Which {segment.description} to include?
      </div>
      <div style={{ display: "inline-block" }} onClick={scrollToBottom}>
        <SASelect
          options={options}
          value={selected}
          onChange={handleSelect}
          isSearchable={true}
          isMulti={isMultiSelect}
          className="allocationSectionInput"
          closeMenuOnSelect={!isMultiSelect}
          hideSelectedOptions={false}
          styles={customSelectStyles}
          components={
            selected.length > 5
              ? { MultiValueContainer: multiValueContainer }
              : {}
          }
        />
      </div>
    </div>
  );
};
