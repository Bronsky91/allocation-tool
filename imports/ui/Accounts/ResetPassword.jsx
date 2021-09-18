import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";

import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { useTracker } from "meteor/react-meteor-data";

import ClipLoader from "react-spinners/ClipLoader";
import { BLUE } from "../../../constants";

export const ResetPassword = () => {
  const { token } = useParams();

  const history = useHistory();
  console.log("token", token);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirmPassword || confirmPassword === "";

  useEffect(() => {
    if (!passwordsMatch) {
      setLoginError("Passwords do not match");
    } else {
      setLoginError("");
    }
  }, [passwordsMatch]);

  const submit = (e) => {
    e.preventDefault();

    console.log("new password", password);
    setLoading(true);

    Accounts.resetPassword(token, password, (err) => {
      if (err) {
        // Display error
        console.log("password reset error", err);
        setLoginError(err.reason);
      } else {
        setLoading(false);
        history.push("/");
      }
    });
  };

  return (
    <div className="loginContainer">
      <form onSubmit={submit} className="loginFormContainer">
        <div style={{ fontSize: 24 }}>
          RedSky Innovations Journal Entry Tool
        </div>
        <div className="loginInnerContainer">
          <div className="loginInputContainer">
            <label className="loginText" htmlFor="username">
              New Password:
            </label>
            <input
              className="loginInput"
              type="password"
              placeholder="Password"
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="loginInputContainer">
            <label className="loginText" htmlFor="password">
              Confirm Password:
            </label>

            <input
              className="loginInput"
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {loading ? (
            <ClipLoader
              color={BLUE}
              loading={loading}
              css={`
                margin-left: 10px;
              `}
            />
          ) : (
            <button type="submit" className="loginButton">
              Reset Password
            </button>
          )}

          <div style={{ color: loginError ? "red" : "#fff" }}>
            {loginError ? loginError : "Error message placeholder"}
          </div>
        </div>
      </form>
    </div>
  );
};
