import React, { useEffect } from "react";
import { useState } from "react";
// Packages
import Select from "react-select";

export const SASelect = (props) => {
  const [selectAllOption, setSelectAllOption] = useState({
    label: "Select All",
    value: "*",
  });

  useEffect(() => {
    if (props.isMulti) {
      setSelectAllOption({
        ...selectAllOption,
        label:
          props.value.length !== props.options.length
            ? "Select All"
            : "Unselect All",
      });
    }
  }, [props.value]);

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
    <Select
      {...props}
      options={
        props.isMulti ? [selectAllOption, ...props.options] : props.options
      }
      onChange={(selected) => {
        if (
          props.isMulti &&
          selected !== null &&
          selected.length > 0 &&
          selected[selected.length - 1].value === selectAllOption.value
        ) {
          if (selected.length - 1 === props.options.length) {
            return props.onChange([]);
          }
          return props.onChange(props.options);
        }
        return props.onChange(selected);
      }}
      closeMenuOnSelect={!props.isMulti}
      components={
        props.isMulti && props.value && props.value.length > 5
          ? { MultiValueContainer: multiValueContainer }
          : {}
      }
    />
  );
};
