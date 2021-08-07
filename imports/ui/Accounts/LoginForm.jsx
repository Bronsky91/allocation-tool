import React, { useState } from "react";
import { Redirect } from "react-router-dom";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { MetricsCollection } from "../../db/MetricsCollection";

export const LoginForm = () => {
  const user = useTracker(() => Meteor.user());
  // Subscriptions
  Meteor.subscribe("segments");
  Meteor.subscribe("metrics");

  const segments = useTracker(() =>
    SegmentsCollection.find({ userId: user?._id }).fetch()
  );
  const metrics = useTracker(() =>
    MetricsCollection.find({ userId: user?._id }).fetch()
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const submit = (e) => {
    e.preventDefault();

    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        setLoginError(err.reason);
      }
    });
  };

  if (user) {
    // If the user has no data yet, redirect to onboarding page
    if (segments.length === 0 || metrics.length === 0) {
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
          <div style={{ color: loginError ? "red" : "#fff" }}>
            {loginError ? loginError : "Error message placeholder"}
          </div>
        </div>
      </form>
    </div>
  );
};
