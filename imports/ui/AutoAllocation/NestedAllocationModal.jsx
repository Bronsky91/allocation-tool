import React, { useState, useEffect } from "react";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
// Utils
import { reconciliationAdjustments } from "../../utils/ReconciliationAdjustments";
import {
  createAllocationAccountString,
  createBalanceAccountString,
} from "../../utils/CreateAccountStrings";
import {
  getAmountByTypicalBalance,
  getBalanceByTypicalBalance,
} from "../../utils/getDataByTypicalBalance";

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
    width: "70%",
    backgroundColor: theme.palette.background.paper,
    // boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "scroll",
  },
}));

export const NestedAllocationModal = ({
  open,
  handleClose,
  data,
  handleCloseComplete,
}) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const initialNestedData = {};
  const initialSelectedRow = "";

  const [modalStyle] = React.useState(getModalStyle);
  const [nestedData, setNestedData] = useState(initialNestedData);
  const [selectedRow, setSelectedRow] = useState(initialSelectedRow);

  useEffect(() => {
    if (open) {
      const reconciledData = reconciliationAdjustments(data);
      const allocationValueArray = [];
      for (const chartField in reconciledData.allocationValueOfBalancePerChartField) {
        allocationValueArray.push({
          ...reconciledData.allocationValueOfBalancePerChartField[chartField],
          chartField,
        });
      }
      setNestedData({
        ...reconciledData,
        allocationValueArray,
      });
    } else {
      setNestedData(initialNestedData);
      setSelectedRow(initialSelectedRow);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <h2 id="simple-modal-title" className="center">
          Select which row you want to create a Nested Allocation for
        </h2>
        <table>
          <tr>
            <th style={{ width: 10 }}>Select</th>
            <th>Account</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
          {/* Map rows here */}
          {nestedData.allocationValueArray
            ? nestedData.allocationValueArray.map((amount, index) => {
                if (amount.chartField === "sum") {
                  return;
                }

                const highlightDebitCell =
                  amount.reconciled && nestedData.typicalBalance === "debit";
                const highlightCreditCell =
                  amount.reconciled && nestedData.typicalBalance === "credit";

                return (
                  <tr
                    key={index}
                    style={
                      selectedRow === amount.chartField
                        ? {
                            borderWidth: 2,
                            borderColor: "#1E90FF",
                            borderStyle: "solid",
                          }
                        : {}
                    }
                  >
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="radio"
                        checked={selectedRow === amount.chartField}
                        onChange={() => setSelectedRow(amount.chartField)}
                      />
                    </td>
                    <td>
                      {createAllocationAccountString(
                        nestedData,
                        amount.chartField
                      )}
                    </td>
                    <td>{nestedData.journalDescription}</td>
                    <td
                      style={{
                        backgroundColor: highlightDebitCell ? "#ffff00" : "",
                      }}
                    >
                      {getAmountByTypicalBalance(
                        nestedData.typicalBalance,
                        amount,
                        "debit"
                      )}
                    </td>
                    <td
                      style={{
                        backgroundColor: highlightCreditCell ? "#ffff00" : "",
                      }}
                    >
                      {getAmountByTypicalBalance(
                        nestedData.typicalBalance,
                        amount,
                        "credit"
                      )}
                    </td>
                  </tr>
                );
              })
            : null}
          {Object.keys(nestedData).length > 0 ? (
            <tr>
              <td></td>
              <td>{createBalanceAccountString(nestedData)}</td>
              <td>{nestedData.journalDescription}</td>
              <td
                style={{
                  backgroundColor:
                    nestedData.allocationValueOfBalancePerChartField.sum
                      .reconciled && nestedData.typicalBalance === "credit"
                      ? "#ffff00"
                      : "",
                }}
              >
                {getBalanceByTypicalBalance(
                  nestedData.typicalBalance,
                  nestedData.allocationValueOfBalancePerChartField.sum,
                  "debit"
                )}
              </td>
              <td
                style={{
                  backgroundColor:
                    nestedData.allocationValueOfBalancePerChartField.sum
                      .reconciled && nestedData.typicalBalance === "debit"
                      ? "#ffff00"
                      : "",
                }}
              >
                {getBalanceByTypicalBalance(
                  nestedData.typicalBalance,
                  nestedData.allocationValueOfBalancePerChartField.sum,
                  "credit"
                )}
              </td>
            </tr>
          ) : null}
        </table>
        {nestedData.allocationValueOfBalancePerChartField &&
        nestedData.allocationValueOfBalancePerChartField.sum.reconciled ? (
          <div
            style={{ marginTop: 10, padding: 8, backgroundColor: "#ffff00" }}
          >{`Notation: ${Math.abs(nestedData.difference).toFixed(2)} was ${
            Math.sign(nestedData.difference) > 0 ? "added to" : "removed from"
          } highlighted account amount to balance`}</div>
        ) : null}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <button
            style={{ padding: 10 }}
            onClick={() =>
              handleCloseComplete({
                value:
                  nestedData.allocationValueOfBalancePerChartField[selectedRow]
                    .value,
                chartField: createAllocationAccountString(
                  nestedData,
                  selectedRow
                ).split("-"),
              })
            }
            disabled={selectedRow === ""}
          >
            Continue with Selection
          </button>
        </div>
      </div>
    </Modal>
  );
};
