import React, { useState, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { CreateWorkbook } from "../../api/CreateWorkbook";
import { SegmentsCollection } from "../../api/Segments";
import { GLSegment } from "./GLSegment";
import { OtherSegment } from "./OtherSegment";

export const JournalForm = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
  // Temp array that should be done from onboarding
  const metricSegments = ["Department", "Location"];
  // TODO: Find a better way to get GL code segments
  const glCodeSegment = segments.find((s) => s.description === "GL Code");
  const nonMetricSegments = segments.filter(
    (s) =>
      !metricSegments.includes(s.description) && s.description !== "GL Code"
  );

  const [formData, setFormData] = useState({
    toBalanceSegmentValue: 0,
    selectedBalanceSegment: {},
    selectedAllocationSegment: {},
    otherSegments: [],
    journalHeader: "",
  });

  // TODO: Select default selectedBalanceSegment and selectedAllocationSegment
  // TODO: Make sure the two above segments are never the same

  useEffect(() => {
    if (nonMetricSegments.length > 0) {
      // Populate the formData with the retrieved nonMetricSegments
      if (formData.otherSegments.length === 0) {
        const otherSegments = nonMetricSegments.map((segment) => ({
          _id: segment._id,
          description: segment.description,
          selectedSubSegment: segment.subSegments[0],
          isApplied: false,
        }));

        handleChangeFormData("otherSegments", otherSegments);
      }
    }
  }, [nonMetricSegments]);

  const handleChangeFormData = (field, value) => {
    console.log(formData);
    setFormData((formData) => ({
      ...formData,
      [field]: value,
    }));
  };

  const handleChangeOtherSegments = (segmentID, field, value) => {
    setFormData((formData) => ({
      ...formData,
      otherSegments: formData.otherSegments.map((segment) => {
        if (segment._id === segmentID) {
          return {
            ...segment,
            [field]: value,
          };
        }
        return segment;
      }),
    }));
  };

  const createJournalEntry = () => {
    console.log(formData);
    // TODO: Fix workbook formatting
    CreateWorkbook(formData);
  };

  return (
    <div className="form">
      <div className="accountsColumn">
        <GLSegment
          data={glCodeSegment}
          handleChangeFormData={handleChangeFormData}
          segmentType="toBalance"
        />
        <GLSegment
          data={glCodeSegment}
          handleChangeFormData={handleChangeFormData}
          segmentType="toAllocate"
        />

        {nonMetricSegments.map((segment, index) => (
          <OtherSegment
            key={index}
            data={segment}
            handleChangeFormData={handleChangeFormData}
            handleChangeOtherSegments={handleChangeOtherSegments}
            segmentType="other"
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
        </div>
      </div>
    </div>
  );
};
