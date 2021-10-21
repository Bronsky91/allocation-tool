import React, { useState, useEffect } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
// Packages
import Select from "react-select";
import { ClipLoader, BarLoader } from "react-spinners";
import { BLUE, GL_CODE, SUB_GL_CODE } from "../../../constants";
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
    width: "30%",
    minWidth: 500,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
  },
}));

export const EditMetricModal = ({
  open,
  handleClose,
  selectedMetric,
  metricData,
  setMetricData,
  metricCoa,
  setEditedSelectedMetric,
}) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = useState(getModalStyle);
  const [completeLoading, setCompleteLoading] = useState(false);

  // Segments possible for allocation
  const possibleAllocationSegmentNames = metricCoa?.segments
    .filter((segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description))
    .map((segment) => segment.description);

  const handleSelectAll = () => {
    setMetricData((metricData) => {
      const allValidMethods = metricData.columns.filter(
        (column) => !metricData.metricSegments.includes(column)
      );

      if (metricData.validMethods.length < allValidMethods.length) {
        // Add the metric name to the validMethods array if the name was checked
        return {
          ...metricData,
          validMethods: [...allValidMethods],
        };
      }
      // Remove the metric name from the validMethods array if the name was unchecked
      return {
        ...metricData,
        validMethods: [],
      };
    });
  };

  const handleMetricChecked = (e, metricColumn) => {
    const checked = e.target.checked;

    setMetricData((metricData) => {
      if (checked) {
        // Add the metric name to the validMethods array if the name was checked
        return {
          ...metricData,
          validMethods: [...metricData.validMethods, metricColumn],
        };
      }
      // Remove the metric name from the validMethods array if the name was unchecked
      return {
        ...metricData,
        validMethods: metricData.validMethods.filter(
          (vm) => vm !== metricColumn
        ),
      };
    });
  };

  const handleCancelMetric = () => {
    // Removes the saved metric from the react hook state
    setMetricData();
    handleClose();
  };

  const handleSaveMetric = () => {
    setCompleteLoading(true);
    // Saves the metric to the chart of accounts
    Meteor.call(
      "chartOfAccounts.metrics.update",
      selectedMetric.coaId,
      selectedMetric._id,
      metricData,
      (err, res) => {
        if (err) {
          alert(`Unable to save metrics: ${err.reason}`);
        } else {
          setEditedSelectedMetric(res);
          setMetricData();
          handleClose();
        }
        setCompleteLoading(false);
      }
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setMetricData();
        handleClose();
      }}
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
          <div style={{ fontWeight: "bold", fontSize: 18 }}>
            Edit Metric - {selectedMetric?.description} -{" "}
            {selectedMetric?.coaName}
          </div>
          {metricData ? (
            <div>
              <div className="onboardMetricOnboardTitle">{metricData.name}</div>
              <div className="onboardMetricOnboardText">
                Segments that can be used in allocations
              </div>
              <ul>
                {possibleAllocationSegmentNames.length > 0
                  ? metricData.columns.map((column, i) => {
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
              <div>
                <div>
                  <div>
                    <button onClick={(e) => handleSelectAll()}>
                      <label style={{ fontWeight: "bold" }}>
                        {metricData.validMethods.length ===
                        metricData.columns.filter(
                          (column) =>
                            !metricData.metricSegments.includes(column)
                        ).length
                          ? "Unselect All"
                          : "Select All"}
                      </label>
                    </button>
                  </div>
                </div>
                {possibleAllocationSegmentNames.length > 0
                  ? metricData.columns.map((column, i) => {
                      // Exclude any columns that match possible allocation segment names
                      if (!possibleAllocationSegmentNames.includes(column)) {
                        return (
                          <div
                            key={i}
                            className="onboardMetricOnboardSelection"
                          >
                            <input
                              type="checkbox"
                              onChange={(e) => handleMetricChecked(e, column)}
                              value={column}
                              checked={metricData.validMethods.includes(column)}
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
              {!completeLoading ? (
                <div style={{ marginBottom: 15 }}>
                  <button
                    onClick={handleSaveMetric}
                    className={`onboardMetricOnboardButton ${
                      metricData.validMethods.length === 0
                        ? "buttonDisabled"
                        : ""
                    }`}
                    disabled={metricData.validMethods.length === 0}
                  >
                    Save Metric
                  </button>
                  <button
                    className="onboardMetricOnboardButton"
                    style={{
                      backgroundColor: "#f54747",
                      marginLeft: "2em",
                    }}
                    onClick={handleCancelMetric}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    margin: 15,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <ClipLoader loading={completeLoading} color={BLUE} />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
