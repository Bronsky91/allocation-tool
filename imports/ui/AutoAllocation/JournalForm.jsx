import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
// import { DeleteIcon, EditIcon, IconButton } from "@material-ui/icons";
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
import { AllocationsCollection } from "../../api/Allocations";

export const JournalForm = () => {
  const segments = useTracker(() => SegmentsCollection.find().fetch());
  const metrics = useTracker(() => MetricsCollection.find().fetch());
  const allocations = useTracker(() => AllocationsCollection.find().fetch());
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

  // TODO: Find a way to do this in onboarding
  const metricData = metrics[0];
  const validMetricNames = [
    "FTE Status",
    "Labor %",
    "Weighted EMP Value",
    "Annual Salary",
    "Labor_Percentage",
    "Annual_Rate",
    "Weighted_Annual_Rate",
  ];
  const availableMetrics = metricData.columns.filter((c) =>
    validMetricNames.includes(c.title)
  );

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(allocations[0]);
  const [newestAllocationId, setNewestAllocationId] = useState();
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
    allocationValueOfBalancePerChartField: {}, // Allocation calculations
    segments, // All segments, used here for creating the workbook
    metricSegments, // Used to dynamically create the chart order in workbook
  });

  const readyToAllocate =
    formData.toBalanceSegmentValue > 0 &&
    formData.journalDescription.length > 0 &&
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

  useEffect(() => {
    if (newestAllocationId) {
      console.log("set NewestAllocationId", newestAllocationId);
      console.log("allocations", allocations);
      setSelectedAllocation(
        allocations.find((a) => a._id === newestAllocationId)
      );
    }
  }, [newestAllocationId]);

  useEffect(() => {
    if (selectedAllocation && formData.toBalanceSegmentValue > 0) {
      console.log(
        "selectedAllocation.subSegments",
        selectedAllocation.subSegments
      );
      Meteor.call(
        "calculateAllocation",
        {
          subSegments: selectedAllocation.subSegments,
          metric: selectedAllocation.metric,
          toBalanceValue: formData.toBalanceSegmentValue,
        },
        (err, allocationData) => {
          if (err) {
            console.log("err", err);
          } else {
            handleChangeFormData(
              "allocationValueOfBalancePerChartField",
              allocationData
            );
          }
        }
      );
    }
  }, [formData.toBalanceSegmentValue, selectedAllocation]);

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

  const handleAllocationChange = (e) => {
    const newAllocationSelected = allocations[e.target.value];
    setSelectedAllocation(newAllocationSelected);
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
    CreateWorkbook(formData);
  };

  return (
    <div className="form">
      <AllocateModal
        open={allocationModalOpen}
        handleClose={closeAllocationModal}
        metricSegments={metricSegments}
        availableMetrics={availableMetrics}
        setNewestAllocationId={setNewestAllocationId}
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
        <button onClick={openAllocationModal} className="mediumButton">
          Create new Allocation Technique
        </button>
        <div className="row">
          <label>Select Allocation Technique:</label>
          <select
            value={allocations.findIndex(
              (allocation) => allocation._id === selectedAllocation?._id
            )}
            onChange={handleAllocationChange}
          >
            {allocations.map((allocation, index) => {
              return (
                <option key={index} value={index}>
                  {allocation.name}
                </option>
              );
            })}
          </select>
          {/* <EditIcon />
          <DeleteIcon /> */}
        </div>
        <div>
          {readyToAllocate ? (
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
