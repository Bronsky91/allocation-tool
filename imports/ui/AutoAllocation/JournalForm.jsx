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
// DB
import { MetricsCollection } from "../../db/MetricsCollection";
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { AllocationsCollection } from "../../db/AllocationsColllection";
// Utils
import { CreateWorkbook } from "../../utils/CreateWorkbook";
// Constants
import { GL_CODE, SUB_GL_CODE } from "../../../constants";

export const JournalForm = () => {
  // Subscriptions
  Meteor.subscribe("segments");
  Meteor.subscribe("metrics");
  Meteor.subscribe("allocations");

  // Current user logged in
  const user = useTracker(() => Meteor.user());

  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user._id }).fetch()
  );
  console.log(segments);
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user._id }).fetch()
  );

  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);

  const allocations = useTracker(() =>
    AllocationsCollection.find({
      userId: user._id,
      metricId: selectedMetric._id,
    }).fetch()
  );

  const GLSegmentNames = [GL_CODE, SUB_GL_CODE];
  const glCodeSegment = segments.find((s) => s.description === GL_CODE);
  const balanceAccountSegments = segments
    .filter((s) => s.description !== SUB_GL_CODE)
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);
  const subGLCodeSegment = segments.find((s) => s.description === SUB_GL_CODE);

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [editAllocationModalOpen, setEditAllocationModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(allocations[0]);
  const [newestAllocationId, setNewestAllocationId] = useState();
  const [editedCurrentAllocation, setEditedCurrentAllocation] = useState();

  const metricSegments = segments
    .filter((s) => selectedMetric.metricSegments.includes(s.description))
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

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

  const nonMetricSegments = segments.filter(
    (s) =>
      !selectedMetric.metricSegments.includes(s.description) &&
      !GLSegmentNames.includes(s.description)
  );
  const availableMethods = selectedMetric.columns.filter((c) =>
    selectedMetric.validMethods.includes(c.title)
  );

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
    // Select the first allocation when the selectedMetric changes
    setSelectedAllocation(allocations[0]);
  }, [selectedMetric]);

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
          method: selectedAllocation.method,
          toBalanceValue: formData.toBalanceSegmentValue,
          userId: user._id,
          metricId: selectedMetric._id,
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
    Meteor.call("allocation.remove", { id: selectedAllocation._id });
    // Moves the next selectedAllocation down one index, unless it's already 0 then keep it 0
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    setSelectedAllocation(allocations[nextIndex]);
  };

  const handleMetricChange = (e) => {
    const newMetricSelected = metrics[e.target.value];
    setSelectedMetric(newMetricSelected);
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
        selectedMetric={selectedMetric} // Required, used to save the allocation to the selected Metric
        availableMethods={availableMethods} // Required, used for listing which method options to use
        setNewestAllocationId={setNewestAllocationId} // Set the newest allocation created as selected in the dropdown
      />
      <AllocateModal
        open={editAllocationModalOpen} // Required
        handleClose={closeEditAllocationModal} // Required
        metricSegments={metricSegments} // Required, used for listing segments and subsegments
        selectedMetric={selectedMetric} // Required, used to save the allocation to the selected Metric
        availableMethods={availableMethods} // Required, used for listing which method options to use
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
        <div>
          <label>Select Metric to Allocate with:</label>
          <select
            value={metrics.findIndex(
              (metric) => metric._id === selectedMetric?._id
            )}
            onChange={handleMetricChange}
          >
            {metrics.map((metric, index) => (
              <option key={index} value={index}>
                {metric.description}
              </option>
            ))}
          </select>
        </div>
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
