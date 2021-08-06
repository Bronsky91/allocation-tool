import React, { useState } from "react";
// React Router
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
// Components
import { UserAccount } from "./Accounts/UserAccount.jsx";
import { JournalFormParent } from "./AutoAllocation/JournalForm.jsx";
import { ImportData } from "./Onboarding/ImportData.jsx";
import { LoginForm } from "./Accounts/LoginForm.jsx";
import { NotFound } from "./NotFound.jsx";

export const App = ({ loggingIn }) => {
  // Must be logged in for this route... Briefly shows '...' while loading account data rather than redirecting...
  const ProtectedRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) => {
        const isLoggedIn = Meteor.userId() !== null;
        return rest.loggingIn ? (
          <span>...</span>
        ) : isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login" }} />
        );
      }}
    />
  );

  // Must be logged in as an admin for this route... Briefly shows '...' while loading account data rather than redirecting...
  const AdminRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) => {
        const isAdmin = Meteor.user() ? Meteor.user().admin : false;
        return rest.loggingIn ? (
          <span>...</span>
        ) : isAdmin ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login" }} />
        );
      }}
    />
  );

  return (
    <Router>
      <Switch>
        <Route exact path="/login" component={LoginForm} />
        <ProtectedRoute
          loggingIn={loggingIn}
          exact
          path="/account"
          component={UserAccount}
        />
        <ProtectedRoute
          loggingIn={loggingIn}
          exact
          path="/onboard"
          component={ImportData}
        />
        <ProtectedRoute
          loggingIn={loggingIn}
          exact
          path="/"
          component={JournalFormParent}
        />
        {/* ### USE FOR REDSKY ADMIN ### */}
        {/* <AdminRoute
          loggingIn={loggingIn}
          exact
          path="/admin"
          component={UserAccount}
        /> */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};
