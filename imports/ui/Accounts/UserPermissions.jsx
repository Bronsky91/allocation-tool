import React, { useState, useEffect } from "react";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { SASelect } from "../AutoAllocation/SASelect";

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

  const allMetrics = chartOfAccounts.reduce(
    (prevCoa, currentCoa) => [...prevCoa, ...currentCoa.metrics],
    []
  );

  const allAllocations = allMetrics.reduce(
    (prevMetric, currentMetric) => [
      ...prevMetric,
      ...currentMetric.allocations,
    ],
    []
  );

  const allTemplates = chartOfAccounts.reduce(
    (prevCoa, currentCoa) => [...prevCoa, ...currentCoa.templates],
    []
  );

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

  const handleChangePermission = (key, keyValue) => {
    Meteor.call(
      "user.permissions.update",
      selectedUser._id,
      key,
      keyValue,
      (err, res) => {
        if (err) {
          console.log("err", err);
          alert(`Unable to save permissions: ${err.reason}`);
        } else {
          console.log("res", res);
        }
      }
    );
  };

  const handleSavePermissions = () => {
    handleChangePermission("chartOfAccounts", selectedChartOfAccountIds);
    handleChangePermission("metrics", selectedMetricIds);
    handleChangePermission("allocations", selectedAllocationIds);
    handleChangePermission("templates", selectedTemplateIds);
    handleChangePermission("createAllocations", createAllocations);
    handleChangePermission("createTemplates", createTemplates);
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
          <div>
            <div>User Permissions for: {selectedUser.name}</div>
            <div className="column">
              <div>
                <label>Chart Of Accounts</label>
                <SASelect
                  isMulti={chartOfAccounts.length > 1}
                  value={selectedChartOfAccountIds}
                  onChange={setSelectedChartOfAccountIds}
                  options={chartOfAccounts.map((coa) => ({
                    label: coa.name,
                    value: coa._id,
                  }))}
                />
              </div>
              <div>
                <label>Metrics</label>
                <SASelect
                  isMulti={allMetrics.length > 1}
                  value={selectedMetricIds}
                  onChange={setSelectedMetricIds}
                  options={allMetrics.map((metric) => ({
                    label: metric.description,
                    value: metric._id,
                  }))}
                />
              </div>
              <div>
                <label>Allocations</label>
                <SASelect
                  isMulti={allAllocations.length > 1}
                  value={selectedAllocationIds}
                  onChange={setSelectedAllocationIds}
                  className="journalFormInputSelect"
                  isMulti={true}
                  options={allAllocations.map((allocation) => ({
                    label: allocation.name,
                    value: allocation._id,
                  }))}
                />
              </div>
              <div>
                <label>Templates</label>
                <SASelect
                  isMulti={allTemplates.length > 1}
                  value={selectedTemplateIds}
                  onChange={setSelectedTemplateIds}
                  options={allTemplates.map((template) => ({
                    label: template.name,
                    value: template._id,
                  }))}
                />
              </div>
              <div>
                <label>Allocations?</label>
                <input
                  type="checkbox"
                  checked={createAllocations}
                  onChange={(e) => setCreateAllocations(e.target.checked)}
                />
              </div>
              <div>
                <label>Templates?</label>
                <input
                  type="checkbox"
                  checked={createTemplates}
                  onChange={(e) => setCreateTemplates(e.target.checked)}
                />
              </div>
              <button onClick={handleSavePermissions}>Save Permissions</button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
  return <div></div>;
};
