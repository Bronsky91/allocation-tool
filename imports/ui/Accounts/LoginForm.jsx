import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { ChartOfAccountsCollection } from "../../db/ChartOfAccountsCollection";

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
  const [loginError, setLoginError] = useState("");

  const submit = (e) => {
    e.preventDefault();

    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        console.log(err);
        setLoginError(err.reason);
      }
    });
  };

  if (user) {
    if (user.redskyAdmin) {
      // User is a RedskyAdmin
      return <Redirect to="/admin" />;
    }
    if (chartOfAccounts.length === 0 && user.admin) {
      // If the user has no data yet, redirect to onboarding page
      return <Redirect to="/onboard" />;
    }
    return <Redirect to="/" />;
  }

  return (
    <div className="loginContainer">
      <form onSubmit={submit} className="loginFormContainer">
        <div style={{ fontSize: 24 }}>
          RedSky Innovations Journal Entry Tool
        </div>
        <div className="loginInnerContainer">
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
          <button type="submit" className="loginButton">
            Log In
          </button>
          <Link
            to="/register"
            style={{
              textDecoration: "inherit",
              color: "#3597fe",
              marginLeft: 10,
              fontSize: 12,
            }}
          >
            Register
          </Link>
          <div style={{ color: loginError ? "red" : "#fff" }}>
            {loginError ? loginError : "Error message placeholder"}
          </div>
        </div>
      </form>
    </div>
  );
};
