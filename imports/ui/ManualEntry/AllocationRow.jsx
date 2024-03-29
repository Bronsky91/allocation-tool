import React, { useEffect, useState } from "react";

export const AllocationRow = ({
  row,
  setRow,
  removeRow,
  segment,
  formData,
}) => {
  // SubSegments that aren't being used in other rows
  const availableSubSegments = segment.subSegments.filter(
    (subSegment) =>
      !formData.allocationRows
        .map((r) => r.selectedSubSegment.segmentId)
        .includes(subSegment.segmentId) ||
      subSegment.segmentId === row.selectedSubSegment.segmentId
  );

  // Default selectedSubSegment state to one that already isn't used
  const handleChangeSelectedSubSegment = (e) => {
    const newSelectedSubSegment = availableSubSegments[e.target.value];
    setRow(row.id, "selectedSubSegment", newSelectedSubSegment);
  };

  return (
    <div className="allocationRow">
      <select
        value={availableSubSegments.findIndex(
          (subSegment) =>
            subSegment.segmentId === row.selectedSubSegment.segmentId
        )}
        onChange={handleChangeSelectedSubSegment}
      >
        {availableSubSegments.map((subSegment, index) => {
          return (
            <option key={index} value={index}>
              {subSegment.description}
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
