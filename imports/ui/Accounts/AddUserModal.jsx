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
    height: "70%",
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

export const AddUserModal = ({ open, handleClose }) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);

  const initialRegisterForm = {
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  };

  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const passwordsMatch =
    registerForm.password === registerForm.confirmPassword ||
    registerForm.confirmPassword === "";

  const formIsFilled = () => {
    for (const field in registerForm) {
      if (registerForm[field] === "") {
        return false;
      }
    }
    return true;
  };

  const formReady = passwordsMatch && formIsFilled();

  const handleRegisterFormChange = (field, value) => {
    const noSpaceFields = ["email", "username", "password", "confirmPassword"];
    // Prevents the user from entering spaces for Email, Password, and Confirm Password
    if (noSpaceFields.includes(field)) {
      value = value.trim();
    }
    if (field === "email" || field === "username") {
      value = value.toLowerCase();
    }
    setRegisterForm((registerForm) => ({
      ...registerForm,
      [field]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    Meteor.call("user.create", registerForm, (err, res) => {
      if (err) {
        setRegisterError(err.reason);
      } else {
        setRegisterForm(initialRegisterForm);
        handleClose();
      }
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
        <form onSubmit={submit} className="registerFormContainerModal">
          <div className="registerInnerContainer">
            <div style={{ fontWeight: "bold" }}>Add User</div>
            <div className="loginInputContainer">
              <label className="loginText" htmlFor="name">
                Name
              </label>
              <input
                className="loginInput"
                type="text"
                placeholder="Name"
                name="name"
                required
                value={registerForm.name}
                onChange={(e) =>
                  handleRegisterFormChange("name", e.target.value)
                }
              />
            </div>
            <div className="loginInputContainer">
              <label className="loginText" htmlFor="email">
                Email Address
              </label>

              <input
                className="loginInput"
                type="text"
                placeholder="Email Address"
                name="email"
                required
                value={registerForm.email}
                onChange={(e) =>
                  handleRegisterFormChange("email", e.target.value)
                }
              />
            </div>
            <div className="loginInputContainer">
              <label className="loginText" htmlFor="username">
                Username
              </label>

              <input
                className="loginInput"
                type="text"
                placeholder="Username"
                name="username"
                required
                value={registerForm.username}
                onChange={(e) =>
                  handleRegisterFormChange("username", e.target.value)
                }
              />
            </div>
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
                value={registerForm.password}
                onChange={(e) =>
                  handleRegisterFormChange("password", e.target.value)
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
                value={registerForm.confirmPassword}
                onChange={(e) =>
                  handleRegisterFormChange("confirmPassword", e.target.value)
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
            <button
              type="submit"
              className={`registerButton ${!formReady ? "buttonDisabled" : ""}`}
              disabled={!formReady}
            >
              Create
            </button>
            <div style={{ color: registerError ? "red" : "#fff" }}>
              {registerError ? registerError : "Error message placeholder"}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
