import React from "react";
import Select from "react-select";

export const SegmentSelect = ({
  value,
  subSegments,
  onChange,
  menuPlacement,
}) => {
  const options = subSegments.map((subSegment, index) => ({
    value: index,
    label: `${subSegment.segmentId} - ${subSegment.description}`,
  }));

  const customSelectStyles = {
    valueContainer: (provided, state) => ({
      ...provided,
      fontSize: 12,
    }),
    menuList: (provided, state) => ({
      ...provided,
      fontSize: 12,
    }),
  };

  return (
    <Select
      onChange={onChange}
      value={options.find((option) => option.value === value)}
      options={options}
      className="journalFormInputSelect"
      isSearchable={true}
      styles={customSelectStyles}
      menuPlacement={menuPlacement ? menuPlacement : "auto"}
    />
  );
};
