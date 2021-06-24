import { Decimal } from "decimal.js";
import { convertDecimalToFixedFloat } from "./ConvertDecimalToFixedFloat";

export const reconciliationAdjustments = (data) => {
  // Make copy of the data object so the reference stays un-mutated
  const reconciledData = JSON.parse(JSON.stringify(data));
  // Check if data needs to be reconciled
  const decimalBalance = new Decimal(reconciledData.toBalanceSegmentValue);
  const decimalSum = new Decimal(
    reconciledData.allocationValueOfBalancePerChartField.sum
  );
  const difference = decimalBalance.minus(decimalSum);

  console.log("difference found", difference.toFixed(2));

  if (difference.equals(0.0)) {
    reconciledData.reconciled = false;
    // TODO: Probably don't do this and avoid checking for the object in the CreateWorkbook if reconciled is false
    for (const chartField in reconciledData.allocationValueOfBalancePerChartField) {
      reconciledData.allocationValueOfBalancePerChartField[chartField] = {
        value: reconciledData.allocationValueOfBalancePerChartField[chartField],
        reconciled: false,
      };
    }
  }
  return reconciledData;
  // TODO: Find which method the user uses
  return roundingPlug(reconciledData, difference);
};

const roundingPlug = (data, difference) => {
  data.reconciled = true;
  // Array of all values, then find the value in the object to tack on meta data
  const arrayOfValues = Object.values(
    data.allocationValueOfBalancePerChartField
  );
  arrayOfValues.pop(); // Popping the sum off the end of the array

  // Heighest Allocation value minus the Sum
  const heighestValue = new Decimal(Math.max(...arrayOfValues));

  let heighestNotated = false; // Flag to stop plugging once heighest value has a match
  for (const chartField in data.allocationValueOfBalancePerChartField) {
    const decimalValue = new Decimal(
      data.allocationValueOfBalancePerChartField[chartField]
    );

    if (chartField === "sum") {
      data.allocationValueOfBalancePerChartField[chartField] = {
        value: convertDecimalToFixedFloat(
          new Decimal(data.allocationValueOfBalancePerChartField.sum).plus(
            difference
          )
        ),
        reconciled: true,
      };
    } else if (!heighestNotated && decimalValue.equals(heighestValue)) {
      // Add reconciled tag true when found
      data.allocationValueOfBalancePerChartField[chartField] = {
        value: convertDecimalToFixedFloat(decimalValue.plus(difference)),
        reconciled: true,
      };
      heighestNotated = true;
    } else {
      data.allocationValueOfBalancePerChartField[chartField] = {
        value: convertDecimalToFixedFloat(decimalValue),
        reconciled: false,
      };
    }
  }

  data.difference = convertDecimalToFixedFloat(difference);

  return data;
};
