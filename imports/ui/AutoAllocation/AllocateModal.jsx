import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import MultiSelect from "react-multi-select-component";
import { SubsegmentDropdown } from "./SubsegmentDropdown";
import { useEffect } from "react";

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
  metrics,
}) => {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);

  const metricSegmentOptions = metricSegments.map((m) => ({
    label: m.description,
    value: m._id,
  }));

  const [selectedMetricSegments, setSelectedMetricSegments] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const [subsegmentsComplete, setSubsegmentsComplete] = useState([]);

  // TODO: Find better way to do this, ie: onboarding
  const validMetricNames = ["FTE Status", "Labor %", "Weighted EMP Value"];
  const validMetricOptions = metrics[0].columns
    .filter((c) => validMetricNames.includes(c.title))
    .map((vm) => ({ label: vm.title, value: vm.title }));

  const isSubsegmentCompleted = () => {
    const selectedSegmentIds = selectedMetricSegments.map((sm) => sm.value);
    console.log("selectedSegmentIds", selectedSegmentIds);
    console.log("subsegmentsComplete", subsegmentsComplete);
    return (
      (selectedSegmentIds.length !== 0 || subsegmentsComplete.length !== 0) &&
      selectedSegmentIds.length === subsegmentsComplete.length &&
      selectedSegmentIds.every((s) => subsegmentsComplete.includes(s))
    );
  };

  useEffect(() => {
    // TODO: If a metric segment is unselected then remove all completed subsegments
  }, [selectedMetricSegments]);

  // Organize by column(s) (ex: Location)
  // Set of locations
  // If multiple then it will be D column in the example (ex: 010-100)
  // Summing another column (WEMPV) by the first column (each location)
  // Summing the result of the summed WEMPV for each location

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <h2 id="simple-modal-title" className="center">
          Let's Allocate some stuff
        </h2>
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
            {selectedMetricSegments.map((segment, index) => {
              // Gets full segment object, need subsegments
              const segmentObject = metricSegments.find(
                (ms) => ms._id === segment.value
              );
              return (
                <SubsegmentDropdown
                  key={index}
                  segment={segmentObject}
                  description={segment.label}
                  setSubsegmentsComplete={setSubsegmentsComplete}
                />
              );
            })}
          </div>

          {/* // TODO: only show this once both columns of drop downs are done. */}
          <div className="column" style={{ width: 200 }}>
            {isSubsegmentCompleted() ? (
              <div>
                <h3>Choose allocation by metric</h3>
                <MultiSelect
                  options={validMetricOptions}
                  value={selectedMetrics}
                  onChange={setSelectedMetrics}
                  labelledBy="Select"
                />
              </div>
            ) : null}
          </div>
        </div>
        <div>
          {/* //TODO: Only have appear after form is done */}
          <button onClick={handleClose}>Complete Allocation</button>
        </div>
      </div>
    </Modal>
  );
};
