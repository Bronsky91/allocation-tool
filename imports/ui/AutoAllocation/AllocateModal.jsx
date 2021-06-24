import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import MultiSelect from "react-multi-select-component";
import { SubsegmentDropdown } from "./SubsegmentDropdown";
import { Decimal } from "decimal.js";
import { reconciliationAdjustments } from "../../api/utils/ReconciliationAdjustments";
import { convertDecimalToFixedFloat } from "../../api/utils/ConvertDecimalToFixedFloat";

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
  toBalanceValue,
  handleChangeFormData,
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
  const validMetricNames = [
    "FTE Status",
    "Labor %",
    "Weighted EMP Value",
    "Annual Salary",
  ];
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

  const completeAllocation = () => {
    const orderedMetricSegments = metricSegments.sort(
      (a, b) => a.chartFieldOrder - b.chartFieldOrder
    );
    // The metric that was selected
    const selectedMetric = validMetrics.filter((vm) =>
      selectedMetrics.map((sm) => sm.value).includes(vm.title)
    )[0];
    const chartFieldSegments = [];
    // An array of all Chart Field arrays that were selected by segment
    // EX: [[010, 020], [110, 120], ...]
    for (const segment of orderedMetricSegments) {
      chartFieldSegments.push(subsegmentFormData[segment.description]);
    }

    // Generates all combinations of chart field array elements:
    // Generator Function found here: https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
    function* cartesian(head, ...tail) {
      let remainder = tail.length ? cartesian(...tail) : [[]];
      for (let r of remainder) for (let h of head) yield [h, ...r];
    }

    // An array of all possible chart field combinations of those selected
    // EX: [[010, 110], [010, 120], ...]
    const allChartFieldCombos = [];
    // Fill the AllChartFieldCombos Array
    for (let c of cartesian(...chartFieldSegments)) {
      allChartFieldCombos.push(c);
    }

    const chartFieldSumObject = {};
    // Loop through each possible Chart Field Combination
    for (const chartField of allChartFieldCombos) {
      // All rows pertaining to the current chart field
      const chartFieldRowArrays = employeeRosterMetrics.columns
        .filter((c) => Object.keys(subsegmentFormData).includes(c.title))
        .map((c) =>
          c.rows
            .filter((row) => chartField.includes(row.value))
            .map((row) => row.rowNumber)
        );
      // Common row numbers between the chart field
      const commonRowNumbersForChartField = chartFieldRowArrays.reduce((p, c) =>
        p.filter((e) => c.includes(e))
      );
      // The selected metric rows of the common row numbers found above
      const selectedMetricRows = employeeRosterMetrics.columns
        .find((c) => c.title === selectedMetric.title)
        .rows.filter((row) =>
          commonRowNumbersForChartField.includes(row.rowNumber)
        );

      // The sum of the metric for the common row numbers for this chart field
      const sumOfSelectedMetric = selectedMetricRows
        .map((row) => new Decimal(row.value))
        .reduce((a, b) => a.plus(b), new Decimal(0));

      // TODO: Create a key in the object that identifies which segment is what using orderedMetricSegments
      // TODO: EX: Location-Department - this will enable to find the chart order field when making the workbook
      // Places the sum of the chart field into an object with the chart field shown as connected with dashes
      chartFieldSumObject[chartField.join("-")] = sumOfSelectedMetric;
    }

    // Array of just the sums for each chart field
    const chartFieldSums = Object.values(chartFieldSumObject);

    // The final sum of the selected Metric
    const sumOfSelectedMetric = chartFieldSums.reduce(
      (a, b) => a.plus(b),
      new Decimal(0)
    );

    // The result of dividing each chart field sum by the the sum of the selected Metric
    const allocationValuePerChartField = {};
    for (const chartField in chartFieldSumObject) {
      const chartFieldSum = new Decimal(chartFieldSumObject[chartField]);
      const allocationValue = chartFieldSum.dividedBy(sumOfSelectedMetric);
      // chartFieldSumObject[chartField] / sumOfSelectedMetric;
      if (allocationValue.equals(0)) {
        // Do not include chart fields that have a 0 allocation value
        continue;
      }
      allocationValuePerChartField[chartField] = allocationValue;
    }

    // Final Object to be sent to Workbook Creator
    const allocationValueOfBalancePerChartField = {};
    const allocationValueOfBalancePerChartFieldArray = [];
    for (const chartField in allocationValuePerChartField) {
      // Creates a number with 2 decimal places
      const allocationValueOfBalance = convertDecimalToFixedFloat(
        allocationValuePerChartField[chartField].times(
          new Decimal(toBalanceValue)
        )
      );
      allocationValueOfBalancePerChartField[chartField] =
        allocationValueOfBalance;
      // Adds to value array to later sum
      allocationValueOfBalancePerChartFieldArray.push(allocationValueOfBalance);
    }

    // Gets sum in Decimal format
    const sumOfAllocationValueOfBalancePerChartField =
      allocationValueOfBalancePerChartFieldArray
        .map((value) => new Decimal(value))
        .reduce((a, b) => a.plus(b), new Decimal(0));

    // Sum in number format
    allocationValueOfBalancePerChartField.sum = convertDecimalToFixedFloat(
      sumOfAllocationValueOfBalancePerChartField
    );

    // TODO: Implement plug feature to make sure sum === the value of the balance
    // TODO: May need extra meta data in the final object other than the number to clarify if it was plugg
    // TODO: Could also do this during workbook creation??
    // Hands to form data
    handleChangeFormData(
      "allocationValueOfBalancePerChartField",
      allocationValueOfBalancePerChartField
    );
    // handleClose();
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
