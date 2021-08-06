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
    <form onSubmit={submit} className="loginForm">
      <div>
        <label htmlFor="username">Username</label>

        <input
          type="text"
          placeholder="Username"
          name="username"
          required
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>

        <input
          type="password"
          placeholder="Password"
          name="password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="mediumButton">
        Log In
      </button>
      <div>{loginError}</div>
    </form>
  );
};
