import React from "react";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Link, Redirect, useHistory, useLocation } from "react-router-dom";
// Material UI
import SettingsIcon from "@material-ui/icons/Settings";
import PersonIcon from "@material-ui/icons/Person";

export const Header = () => {
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
      <div className="headerText">
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
