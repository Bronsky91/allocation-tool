import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import MultiSelect from "react-multi-select-component";
import { SubsegmentDropdown } from "./SubsegmentDropdown";
import { useEffect } from "react";
import { FormatColorResetOutlined } from "@material-ui/icons";

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

  // Lists the selected metric segments by label and _id
  const [selectedMetricSegments, setSelectedMetricSegments] = useState([]);
  // State of all subsegment dropdowns that are based on the selected Metric Segments above
  const [subsegmentFormData, setSubsegmentFormData] = useState({
    // [segment._id]: [array of selected subsegmentIds]
  });

  // TODO: Find better way to do this, ie: onboarding
  const validMetricNames = ["FTE Status", "Labor %", "Weighted EMP Value"];
  const initialMetricOptions = metrics[0].columns
    .filter((c) => validMetricNames.includes(c.title))
    .map((vm) => ({ label: vm.title, value: vm.title }));

  // The options for the metric dropdown
  const [metricOptions, setMetricOptions] = useState(initialMetricOptions);
  // The selected metric from the metric dropdown
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const showMetricDropdown = () => {
    for (const segmentId in subsegmentFormData) {
      // Both subsegments dropdowns at least have on thing selected
      if (subsegmentFormData[segmentId].length === 0) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    console.log(subsegmentFormData);
  }, [subsegmentFormData]);

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
  };

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
            {selectedMetricSegments.length > 0
              ? metricSegments.map((segment, index) => {
                  return (
                    <SubsegmentDropdown
                      key={index}
                      segment={segment}
                      isMultiSelect={selectedMetricSegments
                        .map((sm) => sm.value)
                        .includes(segment._id)}
                      setSubsegmentFormData={setSubsegmentFormData}
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
        <div>
          {/* //TODO: Only have appear after form is done */}
          <button onClick={handleClose}>Complete Allocation</button>
        </div>
      </div>
    </Modal>
  );
};
