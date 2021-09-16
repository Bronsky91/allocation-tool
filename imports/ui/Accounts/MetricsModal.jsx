import React, { useState, useEffect } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";

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

  const [modalStyle] = React.useState(getModalStyle);

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
                <th></th>
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
                    <button>Change</button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(metric)}>Delete</button>
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
