import React, { useState, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { CreateWorkbook } from "../../api/CreateWorkbook";
import { SegmentsCollection } from "../../api/Segments";
import { BalanceAccount } from "./BalanceAccount";
import { GLSegment } from "./GLSegment";
import { SubGLSegment } from "./SubGLSegment";
import { OtherSegment } from "./OtherSegment";
import { AllocateModal } from "./AllocateModal";
import { MetricsCollection } from "../../api/Metrics";
import { GL_CODE, Sub_GL_CODE } from "../../../constants";

export const JournalForm = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
  const metrics = useTracker(() => MetricsCollection.find().fetch());
  // TODO: Temp array that should be done from onboarding
  const metricSegmentNames = ["Department", "Location"];
  const GLSegmentNames = [GL_CODE, Sub_GL_CODE];
  // TODO: Find a better way to get GL code segments
  const glCodeSegment = segments.find((s) => s.description === GL_CODE);
  const balanceAccountSegments = segments
    .filter((s) => s.description !== Sub_GL_CODE)
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  const subGLCodeSegment = segments.find((s) => s.description === Sub_GL_CODE);
  const nonMetricSegments = segments.filter(
    (s) =>
      !metricSegmentNames.includes(s.description) &&
      !GLSegmentNames.includes(s.description)
  );
  const metricSegments = segments
    .filter((s) => metricSegmentNames.includes(s.description))
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    toBalanceSegmentValue: 0,
    selectedBalanceSegments: balanceAccountSegments.map((bas) => ({
      ...bas,
      selectedSubSegment: bas.subSegments[0],
    })),
    selectedAllocationSegment: {},
    subGLSegment: {
      balance: { segmentId: "0000", description: "None" },
      allocations: { segmentId: "0000", description: "None" },
    },
    otherSegments: [],
    journalDescription: "",
    typicalBalance: "",
    allocationValueOfBalancePerChartField: {},
    segments,
    metricSegments, // Used to dynamically create the chart order in workbook
  });

  const readyToAllocate =
    formData.toBalanceSegmentValue > 0 &&
    formData.journalDescription.length > 0;

  const allocationComplete =
    readyToAllocate &&
    Object.keys(formData.allocationValueOfBalancePerChartField).length > 0;

  useEffect(() => {
    if (nonMetricSegments.length > 0) {
      // Populate the formData with the retrieved nonMetricSegments
      if (formData.otherSegments.length === 0) {
        const otherSegments = nonMetricSegments.map((segment) => ({
          _id: segment._id,
          description: segment.description,
          selectedSubSegment: segment.subSegments[0],
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

  const openAllocationModal = () => {
    setAllocationModalOpen(true);
    // Opens Allocation Modal
  };

  const closeAllocationModal = () => {
    setAllocationModalOpen(false);
  };

  const createJournalEntry = () => {
    console.log(formData);
    // TODO: Fix workbook formatting
    CreateWorkbook(formData);
  };

  return (
    <div className="form">
      <AllocateModal
        open={allocationModalOpen}
        handleClose={closeAllocationModal}
        metricSegments={metricSegments}
        metrics={metrics}
        toBalanceValue={formData.toBalanceSegmentValue}
        handleChangeFormData={handleChangeFormData}
      />
      <div className="accountsColumn">
        <BalanceAccount
          data={balanceAccountSegments}
          handleChangeFormData={handleChangeFormData}
          formData={formData}
        />
        <GLSegment
          data={glCodeSegment}
          handleChangeFormData={handleChangeFormData}
          segmentType="toAllocate"
        />
        {subGLCodeSegment ? (
          <SubGLSegment
            data={subGLCodeSegment}
            handleChangeFormData={handleChangeFormData}
          />
        ) : null}
        {nonMetricSegments.map((segment, index) => (
          <OtherSegment
            key={index}
            data={segment}
            handleChangeOtherSegments={handleChangeOtherSegments}
          />
        ))}

        <hr />

        <div>
          <h3>Journal Entry Meta Data</h3>
          <div className="formRow">
            <label className="formLabel">Description:</label>
            <input
              type="text"
              onChange={(e) =>
                handleChangeFormData("journalDescription", e.target.value)
              }
            />
          </div>
        </div>
      </div>
      <div className="autoAllocationColumn">
        <button
          onClick={openAllocationModal}
          className="mediumButton"
          disabled={!readyToAllocate}
        >
          Time to Allocate!
        </button>
        <div>
          {allocationComplete ? (
            <button onClick={createJournalEntry} className="mediumButton">
              Download!
            </button>
          ) : (
            <p>Press Allocation button to get your journal entry download</p>
          )}
        </div>
      </div>
    </div>
  );
};
