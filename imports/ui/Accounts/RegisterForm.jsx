import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

export const RegisterForm = () => {
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

  const history = useHistory();

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

    Meteor.call("user.admin.create", registerForm, (err, res) => {
      if (err) {
        setRegisterError(err.reason);
      } else {
        setRegisterSuccess(true);
      }
    });
  };

  return (
    <div className="loginContainer">
      <form onSubmit={submit} className="registerFormContainer">
        <div style={{ fontSize: 24, marginTop: 10 }}>
          RedSky Innovations Journal Entry Tool
        </div>
        {registerSuccess ? (
          <div className="registerInnerContainer">
            <div>Thanks for signing up!</div>
            <div>Once your account is approved, proceed to the login page</div>
            <button onClick={() => history.push("/login")}>Login</button>
          </div>
        ) : (
          <div className="registerInnerContainer">
            <div style={{ fontWeight: "bold" }}>Account Owner Registration</div>
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
              Register
            </button>
            <div style={{ color: registerError ? "red" : "#fff" }}>
              {registerError ? registerError : "Error message placeholder"}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
