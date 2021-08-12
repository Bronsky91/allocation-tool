import React from "react";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Link, Redirect, useHistory, useLocation } from "react-router-dom";
// Material UI
import SettingsIcon from "@material-ui/icons/Settings";
import PersonIcon from "@material-ui/icons/Person";
import { SegmentsCollection } from "../db/SegmentsCollection";
import { MetricsCollection } from "../db/MetricsCollection";

export const Header = () => {
  // Current user logged in
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

  const history = useHistory();
  const location = useLocation();

  const handleNavigation = (routeName) => {
    if (location.pathname !== routeName) {
      history.push(routeName);
    }
  };

  return (
    <div className="headerContainer">
      <div className="headerButtonContainer"></div>
      <div
        className="headerText"
        onClick={() => {
          console.log(
            "segments.length === 0 || metrics.length === 0",
            segments.length === 0 || metrics.length === 0
          );
          if (segments.length === 0 || metrics.length === 0) {
            handleNavigation("/onboard");
          } else {
            handleNavigation("/");
          }
        }}
      >
        <span className="headerTextLeft">RedSky Innovations</span>{" "}
        <span className="headerTextRight">Journal Entry Tool</span>
      </div>
      <div className="headerButtonContainer">
        <button
          className="headerButton"
          onClick={() => handleNavigation("/settings")}
        >
          <SettingsIcon color="action" fontSize="small" />
        </button>
        <button
          className="headerButton"
          onClick={() => handleNavigation("/account")}
        >
          <PersonIcon color="action" fontSize="small" />
        </button>
      </div>
    </div>
  );
};
