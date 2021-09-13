import React, { useState, useEffect } from "react";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { SASelect } from "../AutoAllocation/SASelect";
import { ClipLoader } from "react-spinners";
import { BLUE } from "../../../constants";

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
    height: "65%",
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

export const UserPermissionsModal = ({
  open,
  handleClose,
  selectedUser,
  chartOfAccounts,
}) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);
  const [selectedChartOfAccountIds, setSelectedChartOfAccountIds] = useState(
    []
  );
  const [selectedMetricIds, setSelectedMetricIds] = useState([]);
  const [selectedAllocationIds, setSelectedAllocationIds] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [createAllocations, setCreateAllocations] = useState(false);
  const [createTemplates, setCreateTemplates] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableMetrics = chartOfAccounts
    .filter((coa) =>
      selectedChartOfAccountIds.map((coaId) => coaId.value).includes(coa._id)
    )
    .reduce((prevCoa, currentCoa) => [...prevCoa, ...currentCoa.metrics], []);

  const availableAllocations = availableMetrics
    .filter((metric) =>
      selectedMetricIds.map((metricId) => metricId.value).includes(metric._id)
    )
    .reduce(
      (prevMetric, currentMetric) => [
        ...prevMetric,
        ...currentMetric.allocations,
      ],
      []
    );

  console.log("availableMetrics", availableMetrics);
  console.log("availableAllocations", availableAllocations);

  const availableTemplates = chartOfAccounts
    .filter((coa) =>
      selectedChartOfAccountIds.map((coaId) => coaId.value).includes(coa._id)
    )
    .reduce((prevCoa, currentCoa) => [...prevCoa, ...currentCoa.templates], []);

  const optionsConsistencyCheck = (
    selectedValues,
    availableValues,
    setSelectedValues
  ) => {
    // Checks to see if the selectedValues are still valid for the availableValues
    // Ran when the parent dependency changes
    const invalidSelectedValues = selectedValues
      .map((s) => s.value)
      .filter((id) => !availableValues.map((v) => v._id).includes(id));

    if (invalidSelectedValues.length > 0) {
      setSelectedValues((sv) =>
        sv.filter((s) => !invalidSelectedValues.includes(s.value))
      );
    }
  };

  useEffect(() => {
    optionsConsistencyCheck(
      selectedMetricIds,
      availableMetrics,
      setSelectedMetricIds
    );
  }, [availableMetrics]);

  useEffect(() => {
    optionsConsistencyCheck(
      selectedAllocationIds,
      availableAllocations,
      setSelectedAllocationIds
    );
  }, [availableAllocations]);

  useEffect(() => {
    optionsConsistencyCheck(
      selectedTemplateIds,
      availableTemplates,
      setSelectedTemplateIds
    );
  }, [availableTemplates]);

  useEffect(() => {
    // Sets permissions that are already saved from DB, set here since first render has no selectedUser
    if (selectedUser?.permissions) {
      setSelectedChartOfAccountIds(selectedUser.permissions.chartOfAccounts);
      setSelectedMetricIds(selectedUser.permissions.metrics);
      setSelectedAllocationIds(selectedUser.permissions.allocations);
      setSelectedTemplateIds(selectedUser.permissions.templates);
      setCreateAllocations(selectedUser.permissions.createAllocations);
      setCreateTemplates(selectedUser.permissions.createTemplates);
    }
  }, [selectedUser]);

  const handleChangePermission = (key, keyValue, last) => {
    Meteor.call(
      "user.permissions.update",
      selectedUser._id,
      key,
      keyValue,
      (err, res) => {
        if (err) {
          console.log("err", err);
          alert(`Unable to save permissions: ${err.reason}`);
          setLoading(false);
        } else {
          console.log("res", res);
          console.log("last", last);
          if (last) {
            setLoading(false);
          }
        }
      }
    );
  };

  const handleSavePermissions = () => {
    setLoading(true);

    handleChangePermission(
      "chartOfAccounts",
      selectedChartOfAccountIds.map((selected) => selected.value)
    );
    handleChangePermission(
      "metrics",
      selectedMetricIds.map((selected) => selected.value)
    );
    handleChangePermission(
      "allocations",
      selectedAllocationIds.map((selected) => selected.value)
    );
    handleChangePermission(
      "templates",
      selectedTemplateIds.map((selected) => selected.value)
    );
    handleChangePermission("createAllocations", createAllocations);
    handleChangePermission("createTemplates", createTemplates, true);
    // TODO: Close modal?
  };

  if (selectedUser) {
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
              justifyContent: "center",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              User Permissions for: {selectedUser.name}
            </div>
            <div className="column">
              <div className="userSettingsPermissionsContainer">
                <label>Chart Of Accounts</label>
                <SASelect
                  className="journalFormInputSelect"
                  isMulti={chartOfAccounts.length > 1}
                  value={selectedChartOfAccountIds}
                  onChange={(selected) =>
                    setSelectedChartOfAccountIds(
                      chartOfAccounts.length > 1 ? [...selected] : [selected]
                    )
                  }
                  options={chartOfAccounts.map((coa) => ({
                    label: coa.name,
                    value: coa._id,
                  }))}
                />
              </div>
              <div className="userSettingsPermissionsContainer">
                <label>Metrics</label>
                <SASelect
                  className="journalFormInputSelect"
                  isMulti={availableMetrics.length > 1}
                  value={selectedMetricIds}
                  onChange={(selected) =>
                    setSelectedMetricIds(
                      availableMetrics.length > 1 ? [...selected] : [selected]
                    )
                  }
                  options={availableMetrics.map((metric) => ({
                    label: metric.description,
                    value: metric._id,
                  }))}
                />
              </div>
              <div className="userSettingsPermissionsContainer">
                <label>Allocations</label>
                <SASelect
                  isMulti={availableAllocations.length > 1}
                  value={selectedAllocationIds}
                  onChange={(selected) =>
                    setSelectedAllocationIds(
                      availableAllocations.length > 1
                        ? [...selected]
                        : [selected]
                    )
                  }
                  className="journalFormInputSelect"
                  options={availableAllocations.map((allocation) => ({
                    label: allocation.name,
                    value: allocation._id,
                  }))}
                />
              </div>
              <div className="userSettingsPermissionsContainer">
                <label>Templates</label>
                <SASelect
                  className="journalFormInputSelect"
                  isMulti={availableTemplates.length > 1}
                  value={selectedTemplateIds}
                  onChange={(selected) =>
                    setSelectedTemplateIds(
                      availableTemplates.length > 1 ? [...selected] : [selected]
                    )
                  }
                  options={availableTemplates.map((template) => ({
                    label: template.name,
                    value: template._id,
                  }))}
                />
              </div>
              <div className="userSettingsPermissionsContainer">
                <label>Create Allocations?</label>
                <input
                  type="checkbox"
                  checked={createAllocations}
                  onChange={(e) => setCreateAllocations(e.target.checked)}
                />
              </div>
              <div className="userSettingsPermissionsContainer">
                <label>Create Templates?</label>
                <input
                  type="checkbox"
                  checked={createTemplates}
                  onChange={(e) => setCreateTemplates(e.target.checked)}
                />
              </div>
              {loading ? (
                <ClipLoader
                  color={BLUE}
                  loading={loading}
                  css={`
                    align-self: center;
                    margin-top: 20px;
                  `}
                />
              ) : (
                <button
                  onClick={handleSavePermissions}
                  className="journalFormSaveTemplateButton userSettingsPermissionsContainer"
                >
                  Save Permissions
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
  return <div></div>;
};
