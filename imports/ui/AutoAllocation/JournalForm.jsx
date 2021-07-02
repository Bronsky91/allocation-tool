import React, { useState, useEffect } from "react";
// Metor imports
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Material UI
import { IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
// Components
import { BalanceAccount } from "./BalanceAccount";
import { GLSegment } from "./GLSegment";
import { SubGLSegment } from "./SubGLSegment";
import { OtherSegment } from "./OtherSegment";
import { AllocateModal } from "./AllocateModal";
// API
import { MetricsCollection } from "../../api/Metrics";
import { CreateWorkbook } from "../../api/CreateWorkbook";
import { SegmentsCollection } from "../../api/Segments";
import { AllocationsCollection, removeAllocation } from "../../api/Allocations";

import { GL_CODE, Sub_GL_CODE } from "../../../constants";

export const JournalForm = () => {
  // Current user logged in
  const user = useTracker(() => Meteor.user());
  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user._id }).fetch()
  );
  const allocations = useTracker(() =>
    AllocationsCollection.find({ userId: user._id }).fetch()
  );

  // TODO: Create a selection in the modal to select which metric in the array the user wants to use
  const metricData = metrics[0];
  const availableMetrics = metricData.columns.filter((c) =>
    metricData.validMethods.includes(c.title)
  );

  const GLSegmentNames = [GL_CODE, Sub_GL_CODE];
  const glCodeSegment = segments.find((s) => s.description === GL_CODE);
  const balanceAccountSegments = segments
    .filter((s) => s.description !== Sub_GL_CODE)
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  const subGLCodeSegment = segments.find((s) => s.description === Sub_GL_CODE);
  const nonMetricSegments = segments.filter(
    (s) =>
      !metricData.metricSegments.includes(s.description) &&
      !GLSegmentNames.includes(s.description)
  );
  const metricSegments = segments
    .filter((s) => metricData.metricSegments.includes(s.description))
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [editAllocationModalOpen, setEditAllocationModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(allocations[0]);
  const [newestAllocationId, setNewestAllocationId] = useState();
  const [editedCurrentAllocation, setEditedCurrentAllocation] = useState();
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
    // After a new allocation is created, make it the currently selected allocation in the dropdown
    if (newestAllocationId) {
      setSelectedAllocation(
        allocations.find((a) => a._id === newestAllocationId)
      );
    }
  }, [newestAllocationId]);

  useEffect(() => {
    // After editing an allocation this is called to refresh the current allocation with the new data from the allocations array
    // This logic needs to be in a useEffect due to the allocations array not updating from the database until a re-render
    setSelectedAllocation(
      allocations.find((a) => a._id === selectedAllocation._id)
    );
  }, [editedCurrentAllocation]);

  useEffect(() => {
    if (selectedAllocation && formData.toBalanceSegmentValue > 0) {
      Meteor.call(
        "calculateAllocation",
        {
          subSegments: selectedAllocation.subSegments,
          metric: selectedAllocation.metric,
          toBalanceValue: formData.toBalanceSegmentValue,
          userId: user._id,
          parentMetricId: metricData._id,
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

  const handleDeleteAllocation = (e) => {
    // Gets current index of selected allocation in the allocations array
    const currentIndex = allocations.findIndex(
      (a) => a._id === selectedAllocation._id
    );
    // Removes the selected Allocation from the database
    removeAllocation(selectedAllocation._id);
    // Moves the next selectedAllocation down one index, unless it's already 0 then keep it 0
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    setSelectedAllocation(allocations[nextIndex]);
  };

  const handleAllocationChange = (e) => {
    const newAllocationSelected = allocations[e.target.value];
    setSelectedAllocation(newAllocationSelected);
  };

  const openAllocationModal = () => {
    // Opens Allocation Modal
    setAllocationModalOpen(true);
  };

  const closeAllocationModal = () => {
    // Close Allocation Modal
    setAllocationModalOpen(false);
  };

  const openEditAllocationModal = () => {
    // Opens Edit Allocation Modal
    setEditAllocationModalOpen(true);
  };

  const closeEditAllocationModal = () => {
    // Close Edit Allocation Modal
    setEditAllocationModalOpen(false);
  };

  const createJournalEntry = () => {
    console.log(formData);
    CreateWorkbook(formData);
  };

  return (
    <div className="form">
      <AllocateModal
        open={allocationModalOpen} // Required
        handleClose={closeAllocationModal} // Required
        metricSegments={metricSegments} // Required, used for listing segments and subsegments
        availableMetrics={availableMetrics} // Required, used for listing which metric options to use
        setNewestAllocationId={setNewestAllocationId} // Set the newest allocation created as selected in the dropdown
      />
      <AllocateModal
        open={editAllocationModalOpen} // Required
        handleClose={closeEditAllocationModal} // Required
        metricSegments={metricSegments} // Required, used for listing segments and subsegments
        availableMetrics={availableMetrics} // Required, used for listing which metric options to use
        currentAllocation={selectedAllocation} // Used to edit the currently selected allocation
        setEditedCurrentAllocation={setEditedCurrentAllocation} // Set the edited allocation as selected in the dropdown to refresh with new data
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
          <label className="center">Select Allocation Technique:</label>
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
          <IconButton
            color="inherit"
            onClick={openEditAllocationModal}
            disabled={!selectedAllocation}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleDeleteAllocation}
            disabled={!selectedAllocation}
          >
            <DeleteIcon />
          </IconButton>
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
