import React, { useEffect, useState } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
// Packages
import MultiSelect from "react-multi-select-component";
// Components
import { SubsegmentDropdown } from "./SubsegmentDropdown";

const getModalStyle = () => {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    height: "80%",
    width: "30%",
    minWidth: 500,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    // padding: theme.spacing(2, 4, 3),
    overflowY: "auto",
    // overflowX: "hidden",
    borderRadius: 8,
  },
}));

export const AllocateModal = ({
  open,
  handleClose,
  metricSegments,
  availableMethods,
  selectedChartOfAccounts,
  selectedMetric,
  setNewestAllocationId, // For creating
  currentAllocation, // For editing
  setEditedCurrentAllocation, // For editing
}) => {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);

  const metricSegmentOptions = metricSegments.map((m) => ({
    label: m.description,
    value: m._id,
  }));

  const initialMethodOptions = availableMethods.map((vm) => ({
    label: vm.title,
    value: vm.title,
    disabled: currentAllocation ? currentAllocation.method !== vm.title : false,
  }));

  // Populates name for editing
  const initialAllocationName = currentAllocation ? currentAllocation.name : "";
  // Populates segments for editing
  const initialSelectedMetricSegments = currentAllocation
    ? metricSegmentOptions.filter((mso) =>
        currentAllocation.subSegments
          .map((s) => s.segmentName)
          .includes(mso.label)
      )
    : [];
  // Populates subsegments for editing
  const intialSubsegmentAllocationData = currentAllocation
    ? currentAllocation.subSegments.reduce(
        (allocationData, currentSubsegment) => {
          return {
            ...allocationData,
            [currentSubsegment.segmentName]: currentSubsegment.subSegmentIds,
          };
        },
        {}
      )
    : {};
  // Populates method for editing
  const initialSelectedMethod = currentAllocation
    ? [
        {
          label: currentAllocation.method,
          value: currentAllocation.method,
          disabled: false,
        },
      ]
    : [];

  // Name of Allocation
  const [allocationName, setAllocationName] = useState(initialAllocationName);
  // Lists the selected metric segments by label and _id
  const [selectedMetricSegments, setSelectedMetricSegments] = useState(
    initialSelectedMetricSegments
  );
  // State of all subsegment dropdowns that are based on the selected Metric Segments above
  const [subsegmentAllocationData, setSubsegmentAllocationData] = useState(
    // [segment._id]: [array of selected subsegmentIds]
    intialSubsegmentAllocationData
  );
  // The options for the metric dropdown
  const [methodOptions, setMethodOptions] = useState(initialMethodOptions);
  // The selected metric from the metric dropdown
  const [selectedMethods, setSelectedMethods] = useState(initialSelectedMethod);

  useEffect(() => {
    // If the modal is closed and is the edit modal
    if (!open) {
      // When edit modal is closed or saved allocation changes it resets it's state to the initial current allocation state
      setAllocationName(initialAllocationName);
      setSelectedMetricSegments(initialSelectedMetricSegments);
      setSubsegmentAllocationData(intialSubsegmentAllocationData);
      setMethodOptions(initialMethodOptions);
      setSelectedMethods(initialSelectedMethod);
    }
    // Only reset when the modal closes or the currentAllocation updates
  }, [open, currentAllocation]);

  useEffect(() => {
    // Update the method options when the avaialable methods update during metric switching
    setMethodOptions(
      availableMethods.map((vm) => ({
        label: vm.title,
        value: vm.title,
        disabled: currentAllocation
          ? currentAllocation.method !== vm.title
          : false,
      }))
    );
  }, [availableMethods]);

  const showMetricDropdown = () => {
    if (Object.keys(subsegmentAllocationData).length === 0) return false;
    for (const segmentId in subsegmentAllocationData) {
      // Both subsegments dropdowns at least have on thing selected
      if (subsegmentAllocationData[segmentId].length === 0) {
        return false;
      }
    }
    return true;
  };

  const readyToSaveAllocate =
    showMetricDropdown() &&
    selectedMethods.length !== 0 &&
    allocationName.length !== 0;

  // Makes Metric Dropdown single select
  const handleSelectedMetrics = (selectedOptions) => {
    // If not multi select dropdown after selection disable all other selections
    if (selectedOptions.length === 1) {
      // One option was selected, make all others disabled
      setMethodOptions((options) =>
        options.map((option) => {
          if (option.value !== selectedOptions[0].value) {
            return { ...option, disabled: true };
          }
          return option;
        })
      );
    } else if (selectedOptions.length === 0) {
      // The one option was deselected, make all options enabled
      setMethodOptions((options) =>
        options.map((option) => ({ ...option, disabled: false }))
      );
    }
    setSelectedMethods(selectedOptions);
  };

  const saveAllocation = () => {
    const name = allocationName;
    const method = selectedMethods[0].value;
    const subSegments = [];
    for (const segmentName in subsegmentAllocationData) {
      subSegments.push({
        segmentName,
        subSegmentIds: subsegmentAllocationData[segmentName],
      });
    }
    if (currentAllocation) {
      // Editing
      Meteor.call(
        "chartOfAccounts.metrics.allocations.update",
        selectedChartOfAccounts._id,
        selectedMetric._id,
        currentAllocation,
        name,
        subSegments,
        method,
        (err, res) => {
          if (err) {
            console.log("err", err);
            alert("Unable to update Allocation");
          } else {
            console.log(res);
            // Once the edit is complete re-select the edited allocation technique to update values for when the modal is next opened
            // A Date timestamp is being used here to be provie a new value for the useEffect so it will be triggered each time
            // This needs to be in a useEffect because the allocations array is only updated on re-renders, which this causes
            setEditedCurrentAllocation(res);
          }
        }
      );
    } else {
      // Creating
      Meteor.call(
        "chartOfAccounts.metrics.allocations.insert",
        selectedChartOfAccounts._id,
        selectedMetric._id,
        name,
        subSegments,
        method,
        (err, result) => {
          if (err) {
            console.log("err", err);
          } else {
            console.log("result", result);
            if (result.numberOfDocumentsUpdate > 0 && result.allocationId) {
              // Once the allocation is saved, make it the selected the allocation in the dropdown
              setNewestAllocationId(result.allocationId);
            }
          }
        }
      );
    }

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <div className="allocationHeaderContainer">
          <div id="simple-modal-title" className="allocationTitle">
            Create Your Allocation
          </div>
          <IconButton color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="allocationNameContainer">
          <div className="allocationNameInnerContainer">
            <div className="allocationText">Technique Name: </div>
            <input
              type="text"
              value={allocationName}
              onChange={(e) => setAllocationName(e.target.value)}
              className="allocationNameInput"
            />
          </div>
        </div>
        <div className="allocationSectionContainer">
          <div className="allocationSectionHeaderContainer">
            <div className="allocationSectionTitle">ALLOCATION BY SEGMENT</div>
            <ExpandLessIcon />
          </div>
          <div className="allocationText">Choose allocation by Segment</div>
          <MultiSelect
            hasSelectAll={metricSegmentOptions.length > 1}
            options={metricSegmentOptions}
            value={selectedMetricSegments}
            onChange={setSelectedMetricSegments}
            labelledBy="Select"
            className="allocationSectionInput"
          />
        </div>

        <div className="allocationSectionContainer">
          <div className="allocationSectionHeaderContainer">
            <div className="allocationSectionTitle">SEGMENTS</div>
            {selectedMetricSegments.length > 0 ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </div>
          {selectedMetricSegments.length > 0
            ? metricSegments.map((segment, index) => {
                return currentAllocation ? (
                  // Subsegment dropdowns used for editing
                  <SubsegmentDropdown
                    key={index}
                    segment={segment}
                    metric={selectedMetric} // Used to only show the subsegments available in the selected metric
                    isMultiSelect={selectedMetricSegments
                      .map((sm) => sm.value)
                      .includes(segment._id)}
                    subsegmentAllocationData={subsegmentAllocationData}
                    setSubsegmentAllocationData={setSubsegmentAllocationData} // Used to prepopulate the allocation data for editing
                  />
                ) : (
                  // Subsegments dropdowns used for creating
                  <SubsegmentDropdown
                    key={index}
                    segment={segment}
                    metric={selectedMetric}
                    isMultiSelect={selectedMetricSegments
                      .map((sm) => sm.value)
                      .includes(segment._id)}
                    setSubsegmentAllocationData={setSubsegmentAllocationData}
                  />
                );
              })
            : null}
        </div>

        <div className="allocationSectionContainer">
          <div>
            <div className="allocationSectionHeaderContainer">
              <div className="allocationSectionTitle">ALLOCATION BY METHOD</div>
              {showMetricDropdown() > 0 ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </div>
            {showMetricDropdown() ? (
              <div>
                <div className="allocationText">
                  Choose allocation by method:
                </div>
                <MultiSelect
                  hasSelectAll={false}
                  options={methodOptions}
                  value={selectedMethods}
                  onChange={handleSelectedMetrics}
                  labelledBy="Select"
                  className="allocationSectionInput"
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="center">
          <button
            className={`allocationSaveButton ${
              !readyToSaveAllocate
                ? "allocationSaveButtonDisabled"
                : "allocationSaveButtonActive"
            }`}
            onClick={saveAllocation}
            disabled={!readyToSaveAllocate}
          >
            Save Allocation
          </button>
        </div>
      </div>
    </Modal>
  );
};
