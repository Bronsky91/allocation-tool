import React from "react";

export const AllocationRow = ({ row, setRow }) => (
  <div className="allocationRow">
    <input
      type="text"
      value={row.title}
      onChange={(e) => setRow(row.id, "title", e.target.value)}
    />
    <input
      type="text"
      value={row.costCenterSegment}
      onChange={(e) => setRow(row.id, "costCenterSegment", e.target.value)}
    />
    <div>
      <input
        type="number"
        value={row.percentage}
        onChange={(e) => setRow(row.id, "percentage", e.target.value)}
      />
      %
    </div>
    <div className="allocationAmount">{row.amount}</div>
  </div>
);
