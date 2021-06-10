import React, { useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { AllocationRow } from "./AllocationRow";
import { CreateWorkbook } from "../api/workbook";
import { SegmentsCollection } from "../api/segments";
import { Segment } from "./Segment";

export const JournalForm = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
  const [allocationSegment, setAllocationSegment] = useState(
    segments[0] || { _id: "", description: "", subSegments: [] }
  );
  const [formData, setFormData] = useState({
    balancingAccountNumber: "",
    balancingAccountTitle: "",
    mainSegmentValue: 0,
    allocationRows: [
      {
        id: 0,
        allocationSegment: {},
        percentage: "",
        amount: 0,
      },
    ],
    journalHeader: "",
  });

  const handleChangeFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleChangeAllocationSegment = (e) => {
    const selectedSegment = segments[e.target.value];
    setAllocationSegment(selectedSegment);
  };

  const addAllocationRow = () => {
    setFormData({
      ...formData,
      allocationRows: [
        ...formData.allocationRows,
        {
          id: formData.allocationRows.length,
          title: "",
          costCenterSegment: "",
          percentage: "",
          amount: 0,
        },
      ],
    });
  };

  const setAllocationRow = (id, field, value) => {
    setFormData((formData) => ({
      ...formData,
      allocationRows: formData.allocationRows.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            [field]: value,
            amount:
              field === "percentage"
                ? formData.balancingAccountValue * (value * 0.01)
                : row.percentage,
          };
        }
        return row;
      }),
    }));
  };

  const createJournalEntry = () => {
    console.log(formData);
    CreateWorkbook(formData);
  };

  const journalValue = formData.allocationRows
    .map((row) => Number(row.amount))
    .reduce((a, b) => a + b, 0);

  const isNotBalanced = journalValue !== Number(formData.balancingAccountValue);

  return (
    <div className="form">
      <div className="accountsColumn">
        <div>
          <h3>Balancing Account</h3>
          <div className="formRow">
            <label className="formLabel">Title:</label>
            <input
              type="text"
              onChange={(e) =>
                handleChangeFormData("balancingAccountTitle", e.target.value)
              }
            />
          </div>
          <div className="formRow">
            <label className="formLabel">Account Number:</label>
            <input
              type="text"
              onChange={(e) =>
                handleChangeFormData("balancingAccountNumber", e.target.value)
              }
            />
          </div>
          <div className="formRow">
            <label className="formLabel">Value:</label>
            <input
              type="number"
              onChange={(e) =>
                handleChangeFormData("balancingAccountValue", e.target.value)
              }
            />
          </div>
        </div>
        {segments.map((segment, index) => (
          <Segment key={index} data={segment} />
        ))}

        <hr />
        <div>
          <h3>Journal Entry Meta Data</h3>
          <div className="formRow">
            <label className="formLabel">Header:</label>
            <input
              type="text"
              onChange={(e) =>
                handleChangeFormData("journalHeader", e.target.value)
              }
            />
          </div>
          <div className="formRow">
            <label className="formLabel">Value:</label>
            {isNotBalanced ? (
              <div className="rowValue red">{journalValue}</div>
            ) : (
              <div className="rowValue">{journalValue}</div>
            )}
          </div>
        </div>
      </div>
      <div className="allocationsColumn">
        <div>
          <div className="center">
            <h3 className="center">Choose Allocation Field:</h3>
            <select
              className="dropDown"
              value={segments.findIndex(
                (segment) => segment._id === allocationSegment._id
              )}
              onChange={handleChangeAllocationSegment}
            >
              {segments.map((segment, index) => {
                return (
                  <option key={segment._id} value={index}>
                    {segment.description}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <div className="allocationRow">
              <div>Title</div>
              <div>Cost Center Segment</div>
              <div>Percentage</div>
              <div>Amount</div>
            </div>
            {formData.allocationRows.map((row) => {
              return (
                <AllocationRow
                  key={row.id}
                  row={row}
                  setRow={setAllocationRow}
                />
              );
            })}
            <div className="center">
              <button onClick={addAllocationRow}>+</button>
            </div>
          </div>
        </div>
        <div className="createJournalEntryContainer">
          <button
            className="createJournalEntryButton"
            onClick={createJournalEntry}
            disabled={isNotBalanced}
          >
            Create Journal Entry
          </button>
        </div>
      </div>
    </div>
  );
};
