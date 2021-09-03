import React, { useEffect } from "react";
import { useState } from "react";
// Packages
import Select from "react-select";

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
      label: s.description,
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
  const [selectAllOption, setSelectAllOption] = useState({
    label: "Select All",
    value: "*",
  });

  const handleSelect = (selectedOption) => {
    const selectedOptionArray = isMultiSelect
      ? [...selectedOption]
      : [selectedOption];
    if (
      selectedOptionArray !== null &&
      selectedOptionArray.length > 0 &&
      selectedOptionArray[selectedOptionArray.length - 1].value ===
        selectAllOption.value
    ) {
      if (selectedOptionArray.length - 1 === options.length) {
        setSelected([]);
      } else {
        setSelected(options);
      }
    } else {
      setSelected(selectedOptionArray);
    }
  };

  useEffect(() => {
    setSubsegmentAllocationData((data) => ({
      ...data,
      [segment.description]: selected.map((s) => s.value),
    }));

    setSelectAllOption({
      ...selectAllOption,
      label: selected.length !== options.length ? "Select All" : "Unselect All",
    });
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
    multiValue: (provided, state) => ({
      ...provided,
      // backgroundColor: "blue",
    }),
  };

  const multiValueContainer = ({ selectProps, data }) => {
    const label = data.label;
    const allSelected = selectProps.value;
    const index = allSelected.findIndex((selected) => selected.label === label);
    const isLastSelected = index === allSelected.length - 1 || index >= 5;
    const count =
      allSelected.length > 5 ? allSelected.length - 5 : allSelected.length;
    const labelSuffix = isLastSelected ? ` and ${count} more...` : ", ";
    const val = index > 5 ? `` : `${label}${labelSuffix}`;
    return val;
  };

  return (
    <div className="column">
      <div className="allocationText">
        Which {segment.description} to include?
      </div>
      <div style={{ display: "inline-block" }} onClick={scrollToBottom}>
        <Select
          options={isMultiSelect ? [selectAllOption, ...options] : options}
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
