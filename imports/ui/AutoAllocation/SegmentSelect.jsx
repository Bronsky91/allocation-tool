import React from "react";
import Select from "react-select";
import { customSelectStyles } from "../../../constants";

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

  return (
    <Select
      onChange={onChange}
      value={options.find((option) => option.value === value) || null}
      options={options}
      className="journalFormInputSelect"
      isSearchable={true}
      styles={customSelectStyles}
      menuPlacement={menuPlacement ? menuPlacement : "auto"}
    />
  );
};
