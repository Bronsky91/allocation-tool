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

  // TODO: Find a way to do this in onboarding
  const employeeRosterMetrics = metrics[0];
  const validMetricNames = ["FTE Status", "Labor %", "Weighted EMP Value"];
  const validMetrics = employeeRosterMetrics.columns.filter((c) =>
    validMetricNames.includes(c.title)
  );
  const initialMetricOptions = validMetrics.map((vm) => ({
    label: vm.title,
    value: vm.title,
  }));

  // Lists the selected metric segments by label and _id
  const [selectedMetricSegments, setSelectedMetricSegments] = useState([]);
  // State of all subsegment dropdowns that are based on the selected Metric Segments above
  const [subsegmentFormData, setSubsegmentFormData] = useState({
    // [segment._id]: [array of selected subsegmentIds]
  });
  // The options for the metric dropdown
  const [metricOptions, setMetricOptions] = useState(initialMetricOptions);
  // The selected metric from the metric dropdown
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const showMetricDropdown = () => {
    if (Object.keys(subsegmentFormData).length === 0) return false;
    for (const segmentId in subsegmentFormData) {
      // Both subsegments dropdowns at least have on thing selected
      if (subsegmentFormData[segmentId].length === 0) {
        return false;
      }
    }
    return true;
  };

  const showCompleteButton = () =>
    showMetricDropdown() && selectedMetrics.length !== 0;

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

  // Organize by column(s) (ex: Location)
  // Set of locations
  // If multiple then it will be D column in the example (ex: 010-100)
  // Summing another column (WEMPV) by the first column (each location)
  // Summing the result of the summed WEMPV for each location

  const completeAllocation = () => {
    // TODO: Use employeeRosterMetrics to get all rows required for math

    const selectedSegmentData = metricSegments.filter((ms) =>
      selectedMetricSegments.map((sm) => sm.value).includes(ms._id)
    );
    console.log("Selected Metric Segments", selectedSegmentData);
    console.log("SubSegments Selected", subsegmentFormData);
    const selectedMetricData = validMetrics.filter((vm) =>
      selectedMetrics.map((sm) => sm.value).includes(vm.title)
    );
    console.log("Selected Metric Data", selectedMetricData);
    console.log("employeeRosterMetrics", employeeRosterMetrics);

    const metricRowArrays = employeeRosterMetrics.columns
      .filter((c) =>
        metricSegments.map((sd) => sd.description).includes(c.title)
      )
      .map((c) =>
        c.rows
          .filter((row) => subsegmentFormData[c.title].includes(row.value))
          .map((row) => row.rowNumber)
      );
    console.log("Metric Row Arrays", metricRowArrays);

    const selectedRowNumbers = metricRowArrays.reduce((p, c) =>
      p.filter((e) => c.includes(e))
    );

    // GOLD BABY!
    console.log("Common Row Numbers", selectedRowNumbers);

    // const subSegmentRowsObject = {};
    // for (const segment of selectedSegmentData) {
    //   const selectedSubSegmentMetricRows = employeeRosterMetrics.columns
    //     .find((c) => c.title === segment.description)
    //     .rows.filter((row) => selectedRowNumbers.includes(row.rowNumber));

    //   const eachSelectedSubsegmentNumber = new Set(
    //     selectedSubSegmentMetricRows.map((s) => s.value)
    //   );

    //   for (const subsegmentNumber of eachSelectedSubsegmentNumber) {

    //     subSegmentRowsObject[segment.description] = {
    //       ...subSegmentRowsObject[segment.description],
    //       [subsegmentNumber]: selectedSubSegmentMetricRows
    //         .filter((s) => s.value === subsegmentNumber)
    //         .map((s) => s.rowNumber),
    //     };
    //   }
    // }

    // console.log("subSegmentRowsObject", subSegmentRowsObject);

    // Loop through each subsegment of the first select segment, then loop through each subsequent subsegments
    // const allOtherSubsegments = Object.keys(subsegmentFormData).filter(
    //   (s) => s !== selectedSegmentData[0].description
    // );
    // for (const subSegments of subsegmentFormData[
    //   selectedSegmentData[0].description // Location
    // ]) {
    //   console.log(`SubSegment: ${subSegments}`);
    //   for (const otherSubSegment of allOtherSubsegments) {
    // console.log(subsegmentFormData[otherSubSegment]);
    //     for (const subSegmentNumber of subsegmentFormData[otherSubSegment]) {
    //       console.log(subSegmentNumber);
    //       const allColumns = employeeRosterMetrics.columns.filter((c) =>
    //         [selectedSegmentData[0].description, otherSubSegment].includes(
    //           c.title
    //         )
    //       );
    //       for (const column of allColumns) {
    //         console.log("column", column);
    //         console.log(
    //           column.rows.filter(
    //             (row) =>
    //               selectedRowNumbers.includes(row.rowNumber) &&
    //               row.value === subSegmentNumber
    //           )
    //         );
    //       }
    //     }
    //   }
    // }

    const selectedMetricRows = employeeRosterMetrics.columns
      .find((c) => c.title === selectedMetricData[0].title)
      .rows.filter((row) => selectedRowNumbers.includes(row.rowNumber));
    console.log("selectedMetricRows", selectedMetricRows);

    const sumOfSelectedMetric = selectedMetricRows
      .map((row) => row.value)
      .reduce((a, b) => a + b, 0);
    console.log("sumOfSelectedMetric", sumOfSelectedMetric);
    // handleClose()
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
        <div className="center" style={{ marginTop: "5em" }}>
          {showCompleteButton() ? (
            <button className="mediumButton" onClick={completeAllocation}>
              Complete Allocation
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
