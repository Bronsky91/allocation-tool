import React, { useState, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { AllocationRow } from "./AllocationRow";
import { CreateWorkbook } from "../api/workbook";
import { SegmentsCollection } from "../api/segments";
import { Segment } from "./Segment";
import PacmanLoader from "react-spinners/PacmanLoader";

export const JournalForm = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
  const allocationSegments = segments.filter(
    (segment) => !["OFFSET", "MAIN"].includes(segment.type)
  );

  const [allocationSegment, setAllocationSegment] = useState();
  const [formData, setFormData] = useState({
    mainSegmentValue: 0,
    segments: [],
    allocationRows: [
      {
        id: 0,
        percentage: "",
        amount: 0,
        selectedSubSegment: {},
      },
    ],
    journalHeader: "",
  });

  useEffect(() => {
    if (segments.length > 0) {
      // Makes sure the first allocation segment is selected
      if (!allocationSegment) {
        setAllocationSegment(allocationSegments[0]);
      }
      // Populate the formData with the retrieved Segments
      if (formData.segments.length === 0) {
        const formSegments = segments.map((segment) => ({
          _id: segment._id,
          description: segment.description,
          type: segment.type,
          chartFieldOrder: segment.chartFieldOrder,
          selectedSubSegment: segment.subSegments[0],
        }));
        handleChangeFormData("segments", formSegments);
      }
    }
  }, [segments]);

  useEffect(() => {
    // When the allocationSegment changes, this updates the formData for the rows
    // Currently it clears the rows and starts over with a single row with the first selectedSegment
    if (allocationSegment) {
      handleChangeFormData("allocationRows", [
        {
          id: 0,
          percentage: "",
          amount: 0,
          selectedSubSegment: allocationSegment.subSegments[0],
        },
      ]);
    }
  }, [allocationSegment]);

  useEffect(() => {
    // Update all Allocation rows when the mainSegmentValue changes
    setFormData((formData) => ({
      ...formData,
      allocationRows: formData.allocationRows.map((row) => {
        return {
          ...row,
          amount: formData.mainSegmentValue * (row.percentage * 0.01),
        };
      }),
    }));
  }, [formData.mainSegmentValue]);

  const handleChangeFormData = (field, value) => {
    console.log(formData);
    setFormData((formData) => ({
      ...formData,
      [field]: value,
    }));
  };

  const handledSelectedSegments = (segmentID, selectedSubSegment) => {
    setFormData((formData) => ({
      ...formData,
      segments: formData.segments.map((segment) => {
        if (segment._id === segmentID) {
          return {
            ...segment,
            selectedSubSegment,
          };
        }
        return segment;
      }),
    }));
  };

  const handleChangeAllocationSegment = (e) => {
    const selectedSegment = allocationSegments[e.target.value];
    setAllocationSegment(selectedSegment);
  };

  const addAllocationRow = () => {
    // Makes sure allocation segment sub-segments don't outnumber allocation rows
    if (formData.allocationRows.length < allocationSegment.subSegments.length) {
      setFormData((formData) => ({
        ...formData,
        allocationRows: [
          ...formData.allocationRows,
          {
            id: formData.allocationRows.length,
            title: "",
            percentage: "",
            amount: 0,
            selectedSubSegment: formData.allocationRows.find(
              (r) =>
                r.selectedSubSegment.number !==
                allocationSegment.subSegments.number
            ),
          },
        ],
      }));
    }
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
                ? formData.mainSegmentValue * (value * 0.01)
                : formData.mainSegmentValue * (row.percentage * 0.01),
          };
        }
        return row;
      }),
    }));
  };

  const createJournalEntry = () => {
    console.log(formData);
    // TODO: Fix workbook formatting
    CreateWorkbook(formData);
  };

  const journalValue = formData.allocationRows
    .map((row) => Number(row.amount))
    .reduce((a, b) => a + b, 0);

  const isNotBalanced = journalValue !== Number(formData.mainSegmentValue);

  return segments.length > 0 ? (
    <div className="form">
      <div className="accountsColumn">
        {
          <Segment
            data={segments.find((segment) => segment.type === "OFFSET")}
            handleChangeFormData={handleChangeFormData}
            handledSelectedSegments={handledSelectedSegments}
          />
        }
        {segments
          .filter((segment) => segment.type !== "OFFSET")
          .map((segment, index) => (
            <Segment
              key={index}
              data={segment}
              handleChangeFormData={handleChangeFormData}
              handledSelectedSegments={handledSelectedSegments}
            />
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
            <h3 className="center">Choose Allocation Segment:</h3>
            <select
              className="dropDown"
              value={
                allocationSegment
                  ? allocationSegments.findIndex(
                      (segment) => segment._id === allocationSegment._id
                    )
                  : 0
              }
              onChange={handleChangeAllocationSegment}
            >
              {allocationSegments.map((segment, index) => {
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
              <div>Allocation Segment</div>
              <div>Percentage</div>
              <div>Amount</div>
            </div>
            {allocationSegment
              ? formData.allocationRows.map((row) => {
                  return (
                    <AllocationRow
                      key={row.id}
                      row={row}
                      setRow={setAllocationRow}
                      segment={allocationSegment}
                      formData={formData}
                    />
                  );
                })
              : null}
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
  ) : (
    <div className="center">
      <PacmanLoader loading={segments.length === 0} />
    </div>
  );
};
