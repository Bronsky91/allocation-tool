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
    width: "40%",
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

export const ChangePasswordModal = ({ open, handleClose, selectedUser }) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const intialPasswordForm = {
    password: "",
    confirmPassword: "",
  };

  const [modalStyle] = useState(getModalStyle);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState(intialPasswordForm);

  const passwordsMatch =
    passwordForm.password === passwordForm.confirmPassword ||
    passwordForm.confirmPassword === "";

  const formIsFilled = () => {
    for (const field in passwordForm) {
      if (passwordForm[field] === "") {
        return false;
      }
    }
    return true;
  };

  const formReady = passwordsMatch && formIsFilled();

  const handlePasswordFormChange = (field, value) => {
    // Prevents the user from entering spaces Password, and Confirm Password
    value = value.trim();
    setPasswordForm((passwordForm) => ({
      ...passwordForm,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setUpdateLoading(true);

    Meteor.call(
      "user.password.set",
      selectedUser._id,
      passwordForm.password,
      (err, res) => {
        if (err) {
          alert(
            `Unable to update password for ${selectedUser.name}: ${err.reason}`
          );
        } else {
          setPasswordForm(intialPasswordForm);
          handleClose();
        }
        setUpdateLoading(false);
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
        <div style={{ fontWeight: "bold" }}>Change Password</div>
        <form onSubmit={handleSubmit}>
          <div className="loginInputContainer">
            <label className="loginText" htmlFor="password">
              Password
            </label>

            <input
              className="loginInput"
              type="password"
              placeholder="Password"
              name="password"
              required
              value={passwordForm.password}
              onChange={(e) =>
                handlePasswordFormChange("password", e.target.value)
              }
            />
          </div>
          <div className="loginInputContainer">
            <label className="loginText" htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              className="loginInput"
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordFormChange("confirmPassword", e.target.value)
              }
            />
            {!passwordsMatch ? (
              <div
                className="loginText"
                style={{
                  padding: 5,
                  color: "red",
                  fontSize: 12,
                  opacity: 0.8,
                }}
              >
                Passwords do not match
              </div>
            ) : null}
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
              className={`loginButton ${!formReady ? "buttonDisabled" : ""}`}
              style={{ marginTop: 20, marginLeft: 0 }}
              disabled={!formReady}
            >
              Change Password
            </button>
          )}
        </form>
      </div>
    </Modal>
  );
};
