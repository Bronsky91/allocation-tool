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

export const AddMetricModal = ({ open, handleClose, chartOfAccounts }) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = useState(getModalStyle);
  const [selectedCoa, setSelectedCoa] = useState(chartOfAccounts[0]);
  const [metricData, setMetricData] = useState();
  const [loading, setLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [fileName, setFileName] = useState();
  const [metricFileInputKey, setMetricFileInputKey] = useState(new Date());

  console.log("metricData", metricData);

  // Segments possible for allocation
  const possibleAllocationSegmentNames = selectedCoa?.segments
    .filter((segment) => ![GL_CODE, SUB_GL_CODE].includes(segment.description))
    .map((segment) => segment.description);

  const handleChartOfAccountChange = (c) => {
    const newSelectedChartOfAccounts = chartOfAccounts.find(
      (coa) => coa._id === c.value
    );
    setSelectedCoa(newSelectedChartOfAccounts);
    setMetricData();
  };

  const handleMetricFile = async (e) => {
    setLoading(true);
    // Excel File
    const file = e.target.files[0];
    setFileName(file.name);
    // Formatted Data
    const data = await ReadWorkbook(file);

    if (data && "sheets" in data && data.sheets.length > 0) {
      const rawMetricData = data.sheets[0];
      if (
        rawMetricData.columns.filter((column) =>
          possibleAllocationSegmentNames.includes(column)
        ).length === 0
      ) {
        // Clear metric upload file input
        setMetricFileInputKey(new Date());
        setLoading(false);
        return alert("No segments are detected, check file and upload again");
      }
      setMetricData({
        ...rawMetricData,
        validMethods: [],
        metricSegments: rawMetricData.columns.filter((column) =>
          possibleAllocationSegmentNames.includes(column)
        ),
      });
    }
    // Clear metric upload file input
    setMetricFileInputKey(new Date());
    setLoading(false);
  };

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
  };

  const handleSaveMetric = () => {
    setCompleteLoading(true);

    // Saves the metric to the chart of accounts
    Meteor.call(
      "chartOfAccounts.metrics.insert",
      selectedCoa._id,
      [metricData],
      (err, res) => {
        if (err) {
          alert(`Unable to save metrics: ${err.reason}`);
        } else {
          setMetricData();
        }
        setCompleteLoading(false);
      }
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        // TODO: Clear interal state
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
            Create New Metric
          </div>
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            Select Chart Of Accounts this Metric will be used for:
          </div>
          <Select
            value={
              chartOfAccounts
                .map((coa) => ({
                  value: coa._id,
                  label: coa.name,
                }))
                .find((coaOption) => coaOption.value === selectedCoa?._id) ||
              null
            }
            onChange={handleChartOfAccountChange}
            className="settingSelect"
            options={chartOfAccounts.map((coa) => ({
              value: coa._id,
              label: coa.name,
            }))}
          />
          <label
            htmlFor="file-upload"
            className="onboardFileInput"
            style={{ display: metricData ? "none" : "block", width: 100 }}
          >
            <span>Choose File</span>
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".xls,.xlsx"
            onChange={handleMetricFile}
            key={metricFileInputKey}
          />
          <BarLoader
            loading={loading}
            color={BLUE}
            css={`
              display: block;
              margin-top: 2em;
            `}
          />
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
