import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";

import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { useTracker } from "meteor/react-meteor-data";

import { ChartOfAccountsCollection } from "../../db/ChartOfAccountsCollection";

import ClipLoader from "react-spinners/ClipLoader";
import { BLUE } from "../../../constants";

export const LoginForm = () => {
  // Subscriptions
  Meteor.subscribe("chartOfAccounts");
  Meteor.subscribe("Meteor.user.admin");

  const chartOfAccounts = useTracker(() =>
    ChartOfAccountsCollection.find({}).fetch()
  );

  const user = useTracker(() => Meteor.user());

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotPasswordEmailSent, setForgotPasswordEmailSent] = useState(false);

  useEffect(() => {
    setLoginError("");
  }, [forgotPassword]);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (forgotPassword) {
      Accounts.forgotPassword({ email: forgotPasswordEmail }, (err, res) => {
        if (err) {
          console.log(err);
          setLoginError(err.reason);
        } else {
          console.log(res);
          setForgotPasswordEmailSent(true);
        }
        setLoading(false);
      });
    } else {
      Meteor.loginWithPassword(username, password, (err) => {
        if (err) {
          console.log(err);
          setLoginError(err.reason);
        }
        setLoading(false);
      });
    }
  };

  if (user) {
    if (user.redskyAdmin) {
      // User is a RedskyAdmin
      return <Redirect to="/admin" />;
    }
    if (chartOfAccounts.length === 0 && user.admin) {
      // If the user has no data yet, redirect to onboarding page
      return <Redirect to="/import" />;
    }
    return <Redirect to="/" />;
  }

  return (
    <div className="loginContainer">
      <form onSubmit={submit} className="loginFormContainer">
        <div style={{ fontSize: 24 }}>RedSky Journal Entry Tool</div>
        <div className="loginInnerContainer">
          {!forgotPassword ? (
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
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          ) : (
            <div className="loginInputContainer">
              <label className="loginText" htmlFor="username">
                Email:
              </label>

              <input
                className="loginInput"
                type="text"
                placeholder="Email"
                name="forgotPasswordEmail"
                required
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
              />
            </div>
          )}
          {!forgotPassword ? (
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : null}
          {loading ? (
            <ClipLoader
              color={BLUE}
              loading={loading}
              css={`
                margin-left: 10px;
              `}
            />
          ) : !forgotPasswordEmailSent ? (
            <button type="submit" className="loginButton">
              {forgotPassword ? `Send Password Reset` : `Log In`}
            </button>
          ) : (
            <div>Password reset email sent, check email to continue</div>
          )}
          <div
            onClick={() => setForgotPassword(!forgotPassword)}
            className="loginLinkText"
          >
            {forgotPassword ? `Login` : `Forgot Password?`}
          </div>
          <div style={{ color: loginError ? "red" : "#fff" }}>
            {loginError ? loginError : "Error message placeholder"}
          </div>
          <Link to="/register" className="loginLinkText">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
};
