import { Decimal } from "decimal.js";
import { MetricsCollection } from "../imports/api/Metrics";
import { convertDecimalToFixedFloat } from "../imports/api/utils/ConvertDecimalToFixedFloat";

export const calcAllocation = ({ subSegments, metric, toBalanceValue }) => {
  // subSegments = The subsegments the user chose in the form ie: {SegmentName: [...subsegmentIds]}
  // metric = The metric that was chosen in the form
  // toBalanceValue == The balance value the user enters to run the allocation against

  // TODO: Get metrics from database by user
  const allMetrics = MetricsCollection.find().fetch();
  const metricData = allMetrics[0];

  // An array of all Chart Field arrays that were selected by segment
  // EX: [[010, 020], [110, 120], ...]
  const chartFieldSegments = subSegments.map((s) => s.subSegmentIds);
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
    const chartFieldRowArrays = metricData.columns
      .filter((c) => subSegments.map((s) => s.segmentName).includes(c.title))
      .map((c) =>
        c.rows
          .filter((row) =>
            chartField.map((cf) => cf.toString()).includes(row.value.toString())
          )
          .map((row) => row.rowNumber)
      );
    // Common row numbers between the chart field
    const commonRowNumbersForChartField = chartFieldRowArrays.reduce((p, c) =>
      p.filter((e) => c.includes(e))
    );
    // The selected metric rows of the common row numbers found above
    const selectedMetricRows = metricData.columns
      .find((c) => c.title === metric)
      .rows.filter((row) =>
        commonRowNumbersForChartField.includes(row.rowNumber)
      );

    // The sum of the metric for the common row numbers for this chart field
    const sumOfSelectedMetric = selectedMetricRows
      .map((row) => new Decimal(row.value))
      .reduce((a, b) => a.plus(b), new Decimal(0));

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

  return allocationValueOfBalancePerChartField;
};
