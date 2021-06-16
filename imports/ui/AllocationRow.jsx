import React, { useEffect, useState } from "react";

export const AllocationRow = ({
  row,
  setRow,
  removeRow,
  segment,
  formData,
}) => {
  // Default selectedSubSegment state to one that already isn't used

  const handleChangeSelectedSubSegment = (e) => {
    const newSelectedSubSegment = segment.subSegments[e.target.value];
    setRow(row.id, "selectedSubSegment", newSelectedSubSegment);
  };

  return (
    <div className="allocationRow">
      <select
        value={segment.subSegments.findIndex(
          (subSegment) => subSegment.number === row.selectedSubSegment.number
        )}
        onChange={handleChangeSelectedSubSegment}
      >
        {segment.subSegments.map((subSegment, index) => {
          return (
            <option key={index} value={index}>
              {subSegment.title}
            </option>
          );
        })}
      </select>
      <div>
        <input
          className="allocationPercent"
          type="number"
          value={row.percentage}
          onChange={(e) => setRow(row.id, "percentage", e.target.value)}
        />
        %
      </div>
      <div className="allocationAmount">{row.amount}</div>
      <button onClick={(e) => removeRow(row.id)}>-</button>
    </div>
  );
};
