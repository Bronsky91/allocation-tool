import React, { useState, useEffect } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import { GL_CODE, SUB_GL_CODE } from "../../../constants";
import { ReadWorkbook } from "../../utils/ReadWorkbook";

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
    height: "60%",
    width: "70%",
    minWidth: 750,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
  },
}));

export const MetricsModal = ({ open, handleClose, chartOfAccounts }) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = useState(getModalStyle);

  const [metricData, setMetricData] = useState([]);
  const [possibleAllocationSegmentNames, setPossibleAllocationSegmentNames] =
    useState([]);
  const [showMethodSelection, setShowMethodSelection] = useState(true);

  const allMetrics = chartOfAccounts
    .map((coa) => ({
      ...coa,
      metrics: coa.metrics.map((metric) => ({
        ...metric,
        coaName: coa.name,
        coaId: coa._id,
      })),
    }))
    .reduce(
      (prevMetric, currentCoa) => [...prevMetric, ...currentCoa.metrics],
      []
    );

  console.log("allMetrics", allMetrics);

  useEffect(() => {
    if (metricData.length === 0) {
      setShowMethodSelection(false);
    } else {
      setShowMethodSelection(true);
    }
  }, [metricData]);

  const handleDelete = (metric) => {
    // TODO: Add confirmation
    Meteor.call(
      "chartOfAccounts.metrics.remove",
      metric.coaId,
      metric._id,
      (err, res) => {
        if (err) {
          console.log(err);
          alert(`Unable to delete Metric: ${err.reason}`);
        }
      }
    );
  };

  // TODO: Implement proper state for metric onboard controls
  const handleFile = async (e, metricId, coaId) => {
    // Previous Metric Data
    const prevMetricData = allMetrics.find((metric) => metric._id === metricId);
    // Segments possible for allocation
    const currentPossibleAllocationSegmentNames = chartOfAccounts
      .find((coa) => coa._id === coaId)
      .segments.filter(
        (segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description)
      )
      .map((segment) => segment.description);

    setPossibleAllocationSegmentNames(currentPossibleAllocationSegmentNames);

    // Excel File
    const file = e.target.files[0];
    // Formatted Data
    const data = await ReadWorkbook(file);

    if (data && "sheets" in data && data.sheets.length > 0) {
      const rawMetricData = data.sheets[0];
      if (
        rawMetricData.columns.filter((column) =>
          currentPossibleAllocationSegmentNames.includes(column)
        ).length === 0
      ) {
        // Clear metric upload file input
        return alert(
          "No useable segments are detected, check file and upload again"
        );
      }

      // TODO: Create blocks if the user tries to upload stupid stuff. Ex: Adding removing columns (maybe?)

      setMetricData((metricData) => {
        // If the metric data uploaded is already being worked with replace it with new file
        if (metricData.map((m) => m.name).includes(rawMetricData.name)) {
          return metricData.map((data) => {
            if (data.name === rawMetricData.name) {
              return {
                ...rawMetricData,
                validMethods: [],
                metricSegments: rawMetricData.columns.filter((column) =>
                  currentPossibleAllocationSegmentNames.includes(column)
                ),
              };
            }
            return data;
          });
        }
        // Add the upload metric data to the working metricData state object
        return [
          ...metricData,
          {
            ...rawMetricData,
            validMethods: [],
            metricSegments: rawMetricData.columns.filter((column) =>
              currentPossibleAllocationSegmentNames.includes(column)
            ),
          },
        ];
      });
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
          }}
        >
          <div>Metrics</div>
          <button>Add New</button>
          <table style={{ width: "85%" }}>
            <tbody>
              <tr>
                <th>Name</th>
                <th>Chart Of Accounts</th>
                <th>Methods</th>
                <th>Update</th>
                <th></th>
              </tr>
              {allMetrics.map((metric, index) => (
                <tr key={index}>
                  <td>{metric.description}</td>
                  <td>{metric.coaName}</td>
                  <td>
                    {metric.validMethods.map((method, i) => (
                      <div key={i}>{method}</div>
                    ))}
                  </td>
                  <td>
                    <input
                      type="file"
                      style={{ display: "inline-block", width: 90 }}
                      accept=".xls,.xlsx"
                      onChange={(e) => {
                        handleFile(e, metric._id, metric.coaId);
                      }}
                      key={metric.updatedAt || metric.createdAt}
                      // Using the updatedAt or createAt date as key since this should change once the update is processed
                      // resetting the input to be available for another upload if needed
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDelete(metric)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showMethodSelection ? (
          <div className="onboardMetricOnboardContainer">
            <div className="onboardMetricOnboardHeaderContainer">
              <div className="onboardTitle" style={{ marginTop: 0 }}>
                Metric Onboarding
              </div>
              <IconButton
                onClick={() => setShowMethodSelection(false)}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            </div>
            {metricData.map((data, index) => (
              <div className="onboardMetricOnboardInnerContainer" key={index}>
                <div className="onboardMetricOnboardTitle">{data.name}</div>
                <div className="onboardMetricOnboardText">
                  Segments that can be used in allocations
                </div>
                <ul>
                  {possibleAllocationSegmentNames.length > 0
                    ? data.columns.map((column, i) => {
                        if (possibleAllocationSegmentNames.includes(column)) {
                          return (
                            <li key={i} style={{ fontWeight: "bold" }} key={i}>
                              {column}
                            </li>
                          );
                        }
                      })
                    : null}
                </ul>
                <div className="onboardMetricOnboardText">
                  Select methods that will be used for allocations
                </div>
                <div className="onboardMetricOnboardSelectionContainer">
                  <div className="onboardMetricOnboardSelection">
                    <div
                      style={{
                        // borderBottom: "1px solid black",
                        width: "10em",
                        marginBottom: "1em",
                      }}
                    >
                      <button onClick={(e) => handleSelectAll(data.name)}>
                        <label style={{ fontWeight: "bold" }}>
                          {data.validMethods.length ===
                          data.columns.filter(
                            (column) => !data.metricSegments.includes(column)
                          ).length
                            ? "Unselect All"
                            : "Select All"}
                        </label>
                      </button>
                    </div>
                  </div>
                  {possibleAllocationSegmentNames.length > 0
                    ? data.columns.map((column, i) => {
                        // Exclude any columns that match possible allocation segment names
                        if (!possibleAllocationSegmentNames.includes(column)) {
                          return (
                            <div
                              key={i}
                              className="onboardMetricOnboardSelection"
                            >
                              <input
                                type="checkbox"
                                onChange={(e) =>
                                  handleMetricChecked(e, data.name, column)
                                }
                                value={column}
                                checked={data.validMethods.includes(column)}
                              />
                              <label style={{ fontWeight: "bold" }}>
                                {column}
                              </label>
                            </div>
                          );
                        }
                      })
                    : null}
                </div>
                <div>
                  <button
                    // onClick={() => handleSaveMetric(data.name)}
                    className={`onboardMetricOnboardButton ${
                      metricData.find((metric) => metric.name === data.name)
                        .validMethods.length === 0
                        ? "buttonDisabled"
                        : ""
                    }`}
                    disabled={
                      metricData.find((metric) => metric.name === data.name)
                        .validMethods.length === 0
                    }
                  >
                    Save Metric
                  </button>
                  <button
                    className="onboardMetricOnboardButton"
                    style={{
                      backgroundColor: "#f54747",
                      marginLeft: "2em",
                    }}
                    // onClick={() => handleCancelMetric(data.name)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
