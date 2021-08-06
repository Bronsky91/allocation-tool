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
import { useTracker } from "meteor/react-meteor-data";
// Components
import { UserAccount } from "./Accounts/UserAccount.jsx";
import { JournalForm } from "./AutoAllocation/JournalForm.jsx";
import { ImportData } from "./Onboarding/ImportData.jsx";
import { LoginForm } from "./Accounts/LoginForm.jsx";
import { Header } from "./Header.jsx";
import { NotFound } from "./NotFound.jsx";

export const App = ({ loggingIn }) => {
  const [selectedPage, setSelectedPage] = useState("import");

  const pages = {
    user: <UserAccount />,
    import: <ImportData />,
    auto: <JournalForm />,
  };

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
          component={JournalForm}
        />
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

  //   <div>
  //     {user ? (
  //       <div>
  //         <div className="user">
  //           <div style={{ display: "flex", flexDirection: "column" }}>
  //             <div>
  //               Currently logged in as:
  //               <span style={{ paddingLeft: 5, fontWeight: "bold" }}>
  //                 {user.username}
  //               </span>
  //             </div>
  //             <div style={{ display: "flex", justifyContent: "space-evenly" }}>
  //               <button
  //                 style={{
  //                   width: "5em",
  //                   alignSelf: "center",
  //                   marginTop: "1em",
  //                 }}
  //                 onClick={() => setSelectedPage("user")}
  //               >
  //                 Account
  //               </button>
  //               <button
  //                 style={{
  //                   width: "5em",
  //                   alignSelf: "center",
  //                   marginTop: "1em",
  //                 }}
  //                 onClick={logout}
  //               >
  //                 Logout
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //         <h1 className="center">JOURNAL ENTRY!</h1>
  //         <div className="center">
  //           <button
  //             className="mediumButton"
  //             onClick={() => setSelectedPage("import")}
  //           >
  //             Import/Onboard
  //           </button>
  //           <button
  //             className="mediumButton"
  //             onClick={() => setSelectedPage("auto")}
  //           >
  //             Auto Allocate Journal
  //           </button>
  //         </div>
  //         {pages[selectedPage]}
  //       </div>
  //     ) : (
  //       <LoginForm />
  //     )}
  //   </div>
  // );
};
