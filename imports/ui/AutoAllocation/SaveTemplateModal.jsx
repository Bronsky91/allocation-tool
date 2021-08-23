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
    height: "20%",
    width: "30%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    // overflow: "scroll",
  },
}));

export const SaveTemplateModal = ({
  open,
  handleClose,
  handleCloseComplete,
}) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);

  const [templateName, setTemplateName] = useState("");

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <div className="saveTemplateContainer">
          <h2 id="simple-modal-title" className="center">
            Name for Template:
          </h2>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="journalFormInput"
          />
          <button
            onClick={() => {
              setTemplateName("");
              handleCloseComplete(templateName);
            }}
            className="allocationSaveButton allocationSaveButtonActive"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};
