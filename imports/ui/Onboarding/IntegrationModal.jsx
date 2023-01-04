import React, { useState, useEffect } from "react";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import LinkIcon from "@material-ui/icons/Link";

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
    width: "20%",
    minWidth: 300,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
  },
}));

export const IntegrationModal = ({ open, handleClose }) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);

  const availableIntegration = [
    {
      name: "QuickBooks",
      logo: "/images/QuickBooks-Logo.png",
      connected: true,
    },
    {
      name: "Dayforce",
      logo: "/images/dayforce-logo.png",
      connected: false,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <div>
          <div
            className="onboardTitle"
            style={{ marginBottom: "1.5em", textAlign: "center" }}
          >
            Select Integration
          </div>
          <div className="integrationListContainer">
            {availableIntegration.map((integration) => (
              <div
                className="integration"
                onClick={() => console.log("testing")}
                key={integration.name}
              >
                <div className="integrationLogoContainer">
                  <img className="integrationLogo" src={integration.logo} />
                  <div style={{ fontSize: 10 }}>{integration.name}</div>
                </div>
                {/* <LinkIcon
                  fontSize="large"
                  style={{
                    color: "#60cead",
                    visibility: integration.connected ? "visible" : "hidden",
                    position: "fixed",
                    right: 10,
                    top: 25,
                  }}
                /> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
