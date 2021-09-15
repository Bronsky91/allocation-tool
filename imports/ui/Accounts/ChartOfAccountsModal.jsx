import React, { useState, useEffect } from "react";
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

export const ChartOfAccountsModal = ({
  open,
  handleClose,
  chartOfAccounts,
  history,
}) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);

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
          <div>Chart of Accounts</div>
          <button onClick={() => history.push("/import")}>Add New</button>
          <table style={{ width: "85%" }}>
            <tbody>
              <tr>
                <th>Name</th>
                <th>Segments</th>
                <th></th>
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
                  <td>
                    <button>Change</button>
                  </td>
                  <td>
                    <button>Delete</button>
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
