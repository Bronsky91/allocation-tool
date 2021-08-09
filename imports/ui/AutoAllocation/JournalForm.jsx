import React, { useState, useEffect } from "react";
// Metor imports
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Material UI
import { IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
// React Packages
import { Redirect } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Components
import { BalanceAccount } from "./BalanceAccount";
import { GLSegment } from "./GLSegment";
import { SubGLSegment } from "./SubGLSegment";
import { OtherSegment } from "./OtherSegment";
import { AllocateModal } from "./AllocateModal";
import { NestedAllocationModal } from "./NestedAllocationModal";
// DB
import { MetricsCollection } from "../../db/MetricsCollection";
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { AllocationsCollection } from "../../db/AllocationsColllection";
// Utils
import { CreateWorkbook } from "../../utils/CreateWorkbook";
// Constants
import { GL_CODE, SUB_GL_CODE } from "../../../constants";
import { Header } from "../Header";
import { ImportData } from "../Onboarding/ImportData";

export const JournalFormParent = () => {
  // Current user logged in
  const user = useTracker(() => Meteor.user());
  // Subscriptions
  Meteor.subscribe("segments");
  Meteor.subscribe("metrics");
  Meteor.subscribe("allocations");

  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user?._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user?._id }).fetch()
  );

  if (!user) {
    return <Redirect to="/login" />;
  }
  if (segments.length > 0 && metrics.length > 0) {
    // Ensures that the JournalForm as Segments and Metrics to function properly
    return (
      <div className="journalFormParent">
        <Header />
        <JournalForm user={user} segments={segments} metrics={metrics} />
      </div>
    );
  }
  return <div>...</div>;
};

const JournalForm = ({ user, segments, metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);

  const allocations = useTracker(() =>
    AllocationsCollection.find({
      userId: user._id,
      metricId: selectedMetric?._id,
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
  const [nestedAllocationOpen, setNestedAllocationOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(allocations[0]);
  const [newestAllocationId, setNewestAllocationId] = useState();
  const [editedCurrentAllocation, setEditedCurrentAllocation] = useState();
  const [nestingAllocation, setNestingAllocation] = useState(false);
  const [showSubGLSegment, setShowSubGLSegment] = useState(false);
  const [selectedSubGLOption, setSelectedSubGLOption] = useState("balance");

  const metricSegments = segments
    .filter((s) => selectedMetric.metricSegments.includes(s.description))
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  const [formData, setFormData] = useState({
    username: user.username,
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
    entryDate: new Date(),
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
  console.log("nonMetricSegments", nonMetricSegments);
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

  const openNestedAllocationModal = () => {
    // Opens Nested Allocation Modal
    setNestedAllocationOpen(true);
  };

  const closeNestedAllocationModal = () => {
    // Close Nested Allocation Modal
    setNestedAllocationOpen(false);
  };

  const closeNestedAllocationWithSelection = (selectionData) => {
    closeNestedAllocationModal();
    // Populate Form with new Nested Allocation Selection Data
    handleChangeFormData("toBalanceSegmentValue", selectionData.value);
    handleChangeFormData(
      "selectedBalanceSegments",
      balanceAccountSegments.map((bas) => {
        return {
          ...bas,
          selectedSubSegment: bas.subSegments.find(
            (subSegment) =>
              subSegment.segmentId.toString() ===
              selectionData.chartField[bas.chartFieldOrder]
          ),
        };
      })
    );
    // If there are subaccounts
    if (subGLCodeSegment) {
      // Segment ID of subaccount
      const subGLCode =
        selectionData.chartField[subGLCodeSegment.chartFieldOrder];

      if (showSubGLSegment) {
        // If the sub GL code was selected
        if (selectedSubGLOption === "allocations") {
          // If the sub GL was used for allocation, switch to balance
          setSelectedSubGLOption("balance");
        } else if (selectedSubGLOption === "balance") {
          // If the sub GL was used for balance, don't use any subGL codes (uncheck option)
          setShowSubGLSegment(false);
        }
      }
    }
  };

  const createJournalEntry = () => {
    if (nestingAllocation) {
      // Show Nesting Modal
      openNestedAllocationModal();
    }
    console.log(formData);
    CreateWorkbook(formData);
  };

  return (
    <div className="journalFormMain">
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
      <NestedAllocationModal
        open={nestedAllocationOpen}
        handleClose={closeNestedAllocationModal}
        data={formData}
        handleCloseComplete={closeNestedAllocationWithSelection}
      />
      <div className="journalFormContainer">
        <div className="journalFormAccountsContainer">
          <div className="journalFormMetaContainer">
            <div className="journalFormTitle">Journal Entry Meta Data</div>
            <div className="formColumn">
              <label className="journalFormText">Description</label>
              <input
                type="text"
                onChange={(e) =>
                  handleChangeFormData("journalDescription", e.target.value)
                }
                style={{ width: "20em", height: "1.5em" }}
                className="journalFormInput"
              />
            </div>
            <div className="formColumn">
              <label className="journalFormText">Entry Date:</label>
              <div>
                <DatePicker
                  selected={formData.entryDate}
                  onChange={(date) => handleChangeFormData("entryDate", date)}
                  className="journalFormInput"
                />
              </div>
            </div>
          </div>
          <div className="journalFormBalanceContainer journalAccountContainer">
            <BalanceAccount
              handleChangeFormData={handleChangeFormData}
              formData={formData}
            />
          </div>
          {nonMetricSegments.length > 0 ? (
            <div className="journalAccountContainer">
              <div className="journalFormTitle">Unused Allocation Fields</div>
              <div
                className="formRow"
                style={{ justifyContent: "flex-start", flexWrap: "wrap" }}
              >
                {nonMetricSegments.map((segment, index) => (
                  <OtherSegment
                    key={index}
                    data={segment}
                    handleChangeOtherSegments={handleChangeOtherSegments}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <div className="journalAccountContainer">
            <GLSegment
              data={glCodeSegment}
              handleChangeFormData={handleChangeFormData}
              segmentType="toAllocate"
            />
            {subGLCodeSegment ? (
              <SubGLSegment
                data={subGLCodeSegment}
                handleChangeFormData={handleChangeFormData}
                showSubGLSegment={showSubGLSegment}
                setShowSubGLSegment={setShowSubGLSegment}
                selectedOption={selectedSubGLOption}
                setSelectedOption={setSelectedSubGLOption}
              />
            ) : null}
          </div>
        </div>
        <div className="journalFormAllocationContainer">
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
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button
              onClick={createJournalEntry}
              className="mediumButton"
              disabled={!readyToAllocate}
            >
              Download!
            </button>
            <div>
              <input
                type="checkbox"
                onChange={(e) => setNestingAllocation(e.target.checked)}
                checked={nestingAllocation}
              />
              <label>Planning to Nest?</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
