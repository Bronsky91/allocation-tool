import React from "react";
// React Router
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Components
import { UserAccount } from "./Accounts/UserAccount.jsx";
import { JournalFormParent } from "./AutoAllocation/JournalForm.jsx";
import { ImportData } from "./Onboarding/ImportData.jsx";
import { LoginForm } from "./Accounts/LoginForm.jsx";
import { NotFound } from "./NotFound.jsx";
import { UserSettings } from "./Accounts/UserSettings.jsx";
import { RedskyAdmin } from "./Accounts/RedskyAdmin.jsx";
import { RegisterForm } from "./Accounts/RegisterForm.jsx";
import { Header } from "./Header.jsx";

export const App = ({ loggingIn }) => {
  Meteor.subscribe("Meteor.user.redskyAdmin");

  const user = useTracker(() => Meteor.user());
  // Must be logged in for this route... Briefly shows '...' while loading account data rather than redirecting...
  const ProtectedRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) => {
        const isLoggedIn = Meteor.userId() !== null;
        return rest.loggingIn ? (
          <Header />
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
        const isAdmin = user ? user.redskyAdmin : false;
        return rest.loggingIn ? (
          <Header />
        ) : isAdmin ? (
          <Component {...props} />
        ) : (
          <NotFound />
        );
      }}
    />
  );

  return (
    <Router>
      <Switch>
        <Route exact path="/login" component={LoginForm} />
        <Route exact path="/register" component={RegisterForm} />
        <ProtectedRoute
          loggingIn={loggingIn}
          exact
          path="/account"
          component={UserAccount}
        />
        <ProtectedRoute
          loggingIn={loggingIn}
          exact
          path="/settings"
          component={UserSettings}
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
        <AdminRoute
          loggingIn={loggingIn}
          user={user}
          exact
          path="/admin"
          component={RedskyAdmin}
        />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};
