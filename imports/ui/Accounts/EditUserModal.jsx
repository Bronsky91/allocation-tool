import React, { useState, useEffect } from "react";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
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
    height: "30%",
    width: "30%",
    minWidth: 500,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export const EditUserModal = ({ open, handleClose, selectedUser }) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = useState(getModalStyle);
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setUpdateLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;

    Meteor.call("user.name.update", selectedUser._id, name, (err, res) => {
      if (err) {
        alert(`Unable to update name: ${err.reason}`);
      }
      Meteor.call("user.email.update", selectedUser._id, email, (err, res) => {
        if (err) {
          alert(`Unable to update email: ${err.reason}`);
        } else {
          handleClose();
        }
        setUpdateLoading(false);
      });
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <div style={{ fontWeight: "bold" }}>Edit User Info</div>
        <form onSubmit={handleSubmit}>
          <div className="loginInputContainer" style={{ marginTop: 10 }}>
            <label className="loginText" htmlFor="name">
              Name
            </label>

            <input
              className="loginInput"
              type="text"
              name="name"
              required
              defaultValue={selectedUser?.name}
            />
          </div>
          <div className="loginInputContainer">
            <label className="loginText" htmlFor="email">
              Email
            </label>
            <input
              className="loginInput"
              type="email"
              name="email"
              required
              defaultValue={
                selectedUser?.emails && selectedUser.emails.length > 0
                  ? selectedUser.emails[0].address
                  : ""
              }
            />
          </div>
          {updateLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                width: 322,
              }}
            >
              <ClipLoader
                color={BLUE}
                loading={updateLoading}
                css={"margin-left: 10px; margin-top: 20px"}
              />
            </div>
          ) : (
            <button
              type="submit"
              className="loginButton"
              style={{ marginTop: 20, marginLeft: 0 }}
            >
              Update
            </button>
          )}
        </form>
      </div>
    </Modal>
  );
};
