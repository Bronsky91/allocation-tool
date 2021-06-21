import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import MultiSelect from "react-multi-select-component";

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
  const metricSubsegmentOptions = metricSegments;

  const [selectedMetricSegments, setSelectedMetricSegments] = useState([]);
  // TODO: These MultiSelects need to be their own custom components so they can manage their useState themselves
  // TODO: Reason being is because the number of "subsegment" dropdowns are determined by the selectedMetricSegments
  const [selectedMetricSubsegments, setSelectedMetricSubsegments] = useState(
    []
  );

  // TODO: Find better way to do this, ie: onboarding
  const validMetricNames = ["FTE Status", "Labor %", "Weighted EMP Value"];
  const validMetrics = metrics[0].columns.filter((c) =>
    validMetricNames.includes(c.title)
  );

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
        <h2 id="simple-modal-title">Let's Allocate some stuff</h2>
        <div className="row">
          <div className="column" style={{ width: 200 }}>
            <h3>Choose allocation by Segment</h3>
            <MultiSelect
              options={metricSegmentOptions}
              value={selectedMetricSegments}
              onChange={setSelectedMetricSegments}
              labelledBy="Select"
            />
          </div>
          {selectedMetricSegments.length > 0 ? (
            // TODO: Not only should this only appear if there are selected Metric Segments
            // TODO: but also disply a multiselect PER selected Metric Segments in a map loop

            // TODO: this also causes another issue, if there are say 4 segments selected then the list will be longer than the modal
            // TODO: need to either make the modal scrollable... or come up with a different UI
            // TODO: This looks promising: https://material-ui.com/components/dialogs/#scrolling-long-content
            <div className="column" style={{ width: 200 }}>
              <h3>Choose allocation by column</h3>
              {/* <MultiSelect
                options={options}
                value={selected}
                onChange={setSelected}
                labelledBy="Select"
              /> */}
            </div>
          ) : null}
          {/* // TODO: only show this once both columns of drop downs are done. */}
          <div className="column" style={{ width: 200 }}>
            {/* <h3>Choose allocation by column</h3> */}
            {/* <MultiSelect
              options={options}
              value={selected}
              onChange={setSelected}
              labelledBy="Select"
            /> */}
          </div>
        </div>
      </div>
    </Modal>
  );
};
