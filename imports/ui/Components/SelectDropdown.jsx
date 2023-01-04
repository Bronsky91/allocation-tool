import React, { useEffect, useState } from "react";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import { IconButton } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

export const SelectDropDown = ({
  selectValues,
  onValueChange,
  defaultValue,
  onNew,
  onEdit,
  onDelete,
  loading,
}) => {
  return (
    <div className="selectRowTopBlock">
      <Select
        value={
          selectValues
            .map((v) => ({
              value: v._id,
              label: v.name,
            }))
            .find((v) => v.value === defaultValue?._id) || null
        }
        onChange={onValueChange}
        className="settingSelect"
        options={selectValues.map((coa) => ({
          value: coa._id,
          label: coa.name,
        }))}
      />
      <IconButton color="inherit" onClick={onNew} style={{ color: "#3597fe" }}>
        <AddIcon fontSize="default" />
      </IconButton>
      <IconButton color="inherit" onClick={onEdit} style={{ color: "#60cead" }}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        color="inherit"
        onClick={onDelete}
        style={{ color: "#f54747" }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      {loading ? (
        <ClipLoader
          color={BLUE}
          loading={loading}
          size={25}
          css={`
            margin-left: 10px;
          `}
        />
      ) : null}
    </div>
  );
};
