import React, { useState, useEffect } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { isChartOfAccountWorkBookDataValid } from "../../utils/CheckWorkbookData";
import { ReadWorkbook } from "../../utils/ReadWorkbook";
import {
  CHART_OF_ACCOUNT_COLUMNS,
  VALID_COLUMN_NAMES,
} from "../../../constants";

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
    height: "40%",
    width: "60%",
    minWidth: 750,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
  },
}));

export const ChartOfAccountsModal = ({
  open,
  handleClose,
  chartOfAccounts,
  history,
}) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);

  // TODO: Implement loading indicators for Meteor.call() actions

  const handleDelete = (id) => {
    const coaToDelete = chartOfAccounts.find((coa) => coa._id === id);
    const isConfirmed = confirm(
      `Are you sure you want to delete the ${coaToDelete.name} chart of accounts?`
    );
    if (isConfirmed) {
      Meteor.call("chartOfAccounts.remove", id, (err, res) => {
        if (err) {
          console.log(err);
          alert(`Unable to delete Chart of Accounts: ${err.reason}`);
        }
      });
    }
  };

  const handleFile = async (e, id) => {
    const currentChartOfAccounts = chartOfAccounts.find(
      (coa) => coa._id === id
    );
    const currentSegments = currentChartOfAccounts.segments;
    const validSheetNamesToUpdate = currentSegments.map(
      (segment) => segment.description
    );

    // Excel File
    const file = e.target.files[0];

    // Formatted Data
    const workbookData = await ReadWorkbook(file);
    // Checks if the workbookData is valid
    const output = isChartOfAccountWorkBookDataValid(workbookData);

    // This array is used to hold all the new segment data processed below and sent to Meteor.call()
    let segments = [];

    if (output.valid) {
      // Create the Segments from the Formatted Data
      for (const [index, sheet] of workbookData.sheets.entries()) {
        // If the sheet.name isn't one that was used before ignore the sheet
        // This prevents the user from adding more segments or changing the segment name / chart field order
        if (!validSheetNamesToUpdate.includes(sheet.name)) {
          continue;
        }
        // Since we know the sheet.name is included in the valid sheet names from the previous file
        // we grab the current segment to keep the _id, chartFieldOrder, etc
        const currentSegment = currentChartOfAccounts.segments.find(
          (segment) => segment.description === sheet.name
        );
        // Columns object that matches the columns to it's index in the sheet to be inserted properly in the rows map
        const columnIndexRef = sheet.columns.reduce(
          (columnIndexRefObj, columnName, i) => {
            // If the column in the sheet is valid for processing, add it to the object
            if (VALID_COLUMN_NAMES.includes(columnName)) {
              return {
                ...columnIndexRefObj,
                [i]: CHART_OF_ACCOUNT_COLUMNS[columnName],
              };
            }
            // Otherwise return the object as-is and continue
            return columnIndexRefObj;
          },
          {}
        );

        const subSegments = sheet.rows
          .filter((row) => row.length > 1)
          .map((row) => {
            const subSegment = {};
            row.map((r, i) => {
              // This makes sure it only assigns values to valid columns
              if (
                Object.keys(columnIndexRef)
                  .map((c) => Number(c)) // Need to convert to number because Object.keys() makes strings
                  .includes(i)
              ) {
                subSegment[columnIndexRef[i]] = r.value;
              }
            });
            return subSegment;
          });

        // The only thing we're really changing for each segment are the subsegments
        segments.push({
          ...currentSegment,
          subSegments,
        });
      }

      console.log("segments", segments);

      const subSegmentsAdded = segments.flatMap((segment) => {
        const oldSegment = currentSegments.find(
          (currrentSegment) => currrentSegment._id === segment._id
        );
        return segment.subSegments.filter(
          (subSegment) =>
            !oldSegment.subSegments
              .map((s) => s.segmentId.toString())
              .includes(subSegment.segmentId.toString())
        );
      });
      console.log("subSegmentsAdded", subSegmentsAdded);

      const subSegmentsRemoved = currentSegments.flatMap((oldSegment) => {
        const newSegment = segments.find(
          (segment) => segment._id === oldSegment._id
        );
        return oldSegment.subSegments.filter(
          (oldSubSegment) =>
            !newSegment.subSegments
              .map((s) => s.segmentId.toString())
              .includes(oldSubSegment.segmentId.toString())
        );
      });
      console.log("subSegmentsRemoved", subSegmentsRemoved);

      // TODO: Create a confirmation box that displays which subsegments are being removed/added

      Meteor.call(
        "chartOfAccounts.segments.update",
        id,
        segments,
        (err, res) => {
          if (err) {
            console.log(err);
            alert(`Unable to update chart of accounts: ${err.reason}`);
          } else {
            console.log("updated coa", res);
          }
        }
      );
    } else {
      // Displays an alert to the user and an error message why the chart of the accounts isn't valid
      alert(output.err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div className="onboardTitle">Chart of Accounts</div>
          <button
            onClick={() => history.push("/import")}
            className="simpleButton button"
            style={{ margin: 20 }}
          >
            Add New
          </button>
          <table style={{ width: "85%" }}>
            <tbody>
              <tr>
                <th>Name</th>
                <th>Segments</th>
                <th>Update</th>
                <th></th>
              </tr>
              {chartOfAccounts.map((coa, index) => (
                <tr key={index}>
                  <td>{coa.name}</td>
                  <td>
                    {coa.segments.map((segment) => (
                      <div>{segment.description}</div>
                    ))}
                  </td>
                  {/* <td>
                    <label htmlFor="coa-upload" className="editFileInput">
                      <span>Choose File</span>
                    </label>
                  </td> */}
                  <td>
                    <IconButton
                      color="inherit"
                      // onClick={() => handleDelete(coa._id)}
                      style={{ color: "#f54747" }}
                    >
                      <DeleteIcon />
                      <input
                        type="file"
                        id="coa-upload"
                        accept=".xls,.xlsx"
                        onChange={(e) => handleFile(e, coa._id)}
                        key={coa.updatedAt || coa.createdAt}
                        // Using the updatedAt or createAt date as key since this should change once the update is processed
                        // resetting the input to be available for another upload if needed
                      />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
