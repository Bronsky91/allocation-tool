import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import MultiSelect from "react-multi-select-component";
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
    height: "70%",
    width: "80%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

// TODO: Use this to have scrollable modal https://material-ui.com/components/dialogs/#scrolling-long-content
export const AllocateModal = ({
  open,
  handleClose,
  metricSegments,
  availableMetrics,
  setNewestAllocationId, // For creating
  currentAllocation, // For editing
}) => {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);

  const metricSegmentOptions = metricSegments.map((m) => ({
    label: m.description,
    value: m._id,
  }));

  const initialMetricOptions = availableMetrics.map((vm) => ({
    label: vm.title,
    value: vm.title,
    disabled: currentAllocation ? currentAllocation.metric !== vm.title : false,
  }));

  console.log("currentAllocation", currentAllocation);
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
  // Populates metric for editing
  const initialSelectedMetric = currentAllocation
    ? [
        {
          label: currentAllocation?.metric,
          value: currentAllocation?.metric,
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
  const [metricOptions, setMetricOptions] = useState(initialMetricOptions);
  // The selected metric from the metric dropdown
  const [selectedMetrics, setSelectedMetrics] = useState(initialSelectedMetric);

  useEffect(() => {
    // If the modal is closed and is the edit modal
    if (!open) {
      // When edit modal is closed or saved allocation changes it resets it's state to the initial current allocation state
      setAllocationName(initialAllocationName);
      setSelectedMetricSegments(initialSelectedMetricSegments);
      setSubsegmentAllocationData(intialSubsegmentAllocationData);
      setSelectedMetrics(initialSelectedMetric);
    }
    // Only reset when the modal closes or the currentAllocation updates
  }, [open, currentAllocation]);

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
    selectedMetrics.length !== 0 &&
    allocationName.length !== 0;

  // Makes Metric Dropdown single select
  const handleSelectedMetrics = (selectedOptions) => {
    // If not multi select dropdown after selection disable all other selections
    if (selectedOptions.length === 1) {
      // One option was selected, make all others disabled
      setMetricOptions((options) =>
        options.map((option) => {
          if (option.value !== selectedOptions[0].value) {
            return { ...option, disabled: true };
          }
          return option;
        })
      );
    } else if (selectedOptions.length === 0) {
      // The one option was deselected, make all options enabled
      setMetricOptions((options) =>
        options.map((option) => ({ ...option, disabled: false }))
      );
    }
    setSelectedMetrics(selectedOptions);
  };

  const saveAllocation = () => {
    const name = allocationName;
    const metric = selectedMetrics[0].value;
    const subSegments = [];
    for (const segmentName in subsegmentAllocationData) {
      subSegments.push({
        segmentName,
        subSegmentIds: subsegmentAllocationData[segmentName],
      });
    }
    if (currentAllocation) {
      // Editing
      console.log("editing", { name, subSegments, metric });
      const id = currentAllocation._id;
      Meteor.call(
        "updateAllocation",
        { id, name, subSegments, metric },
        (err, res) => {
          if (err) {
            console.log("err", err);
          } else {
            // Once the edit is complete re-select the edited allocation technique to update values for when the modal is next opened
            setNewestAllocationId(id);
            // TODO: This does NOT trigger the useEffect to select a "new" updated currentAllocation
            // TODO: Find a way to update the currentAllocation to the same but updated object to update initial values here
            console.log("should have setNewestAllocaitonId", id);
          }
        }
      );
    } else {
      // Creating
      Meteor.call(
        "insertAllocation",
        { name, subSegments, metric },
        (err, newAllocationId) => {
          if (err) {
            console.log("err", err);
          } else {
            setNewestAllocationId(newAllocationId);
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
        <h2 id="simple-modal-title" className="center">
          Create your Allocation
        </h2>
        <div className="row center">
          <h3>Technique Name: </h3>
          <input
            type="text"
            value={allocationName}
            onChange={(e) => setAllocationName(e.target.value)}
          />
        </div>
        <div className="autoAllocationRow">
          <div className="column" style={{ width: 200 }}>
            <h3>Choose allocation by Segment</h3>
            <MultiSelect
              options={metricSegmentOptions}
              value={selectedMetricSegments}
              onChange={setSelectedMetricSegments}
              labelledBy="Select"
            />
          </div>

          <div className="dropDownColumn" style={{ width: 200 }}>
            {selectedMetricSegments.length > 0
              ? metricSegments.map((segment, index) => {
                  return currentAllocation ? (
                    // Subsegment dropdowns used for editing
                    <SubsegmentDropdown
                      key={index}
                      segment={segment}
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
                      isMultiSelect={selectedMetricSegments
                        .map((sm) => sm.value)
                        .includes(segment._id)}
                      setSubsegmentAllocationData={setSubsegmentAllocationData}
                    />
                  );
                })
              : null}
          </div>

          <div className="column" style={{ width: 200 }}>
            {showMetricDropdown() ? (
              <div>
                <h3>Choose allocation by metric</h3>
                <MultiSelect
                  hasSelectAll={false}
                  options={metricOptions}
                  value={selectedMetrics}
                  onChange={handleSelectedMetrics}
                  labelledBy="Select"
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="center" style={{ marginTop: "5em" }}>
          <button
            className="mediumButton"
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
