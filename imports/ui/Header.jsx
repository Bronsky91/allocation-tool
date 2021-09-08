import React from "react";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Router
import { Link, Redirect, useHistory, useLocation } from "react-router-dom";
// DB
import { ChartOfAccountsCollection } from "../db/ChartOfAccountsCollection";
// Material UI
import SettingsIcon from "@material-ui/icons/Settings";
import PersonIcon from "@material-ui/icons/Person";
// Packages
import Select from "react-select";
import { customSelectStyles } from "../../constants";

export const Header = ({
  selectedChartOfAccountsId,
  setSelectChartOfAccountsId,
}) => {
  // Current user logged in
  const user = useTracker(() => Meteor.user());
  // Subscriptions
  Meteor.subscribe("chartOfAccounts");
  Meteor.subscribe("Meteor.user.admin");

  const chartOfAccounts = useTracker(() =>
    ChartOfAccountsCollection.find({}).fetch()
  );

  const history = useHistory();
  const location = useLocation();

  const handleNavigation = (routeName) => {
    if (location.pathname !== routeName) {
      history.push(routeName);
    }
  };

  const handleChartOfAccountChange = (selected) => {
    setSelectChartOfAccountsId(selected.value);
  };

  const headerButtonContainerWidth =
    location.pathname === "/" && chartOfAccounts.length > 0 ? "26em" : "90px";

  return (
    <div className="headerContainer">
      <div
        className="headerButtonContainer"
        style={{ width: headerButtonContainerWidth }}
      ></div>
      <div
        className="headerText"
        onClick={() => {
          if (chartOfAccounts.length === 0 && user.admin) {
            handleNavigation("/onboard");
          } else {
            handleNavigation("/");
          }
        }}
      >
        <span className="headerTextLeft">RedSky Innovations</span>{" "}
        <span className="headerTextRight">Allocation Tool</span>
      </div>
      <div
        className="headerButtonContainer"
        style={{ width: headerButtonContainerWidth }}
      >
        {location.pathname === "/" && chartOfAccounts.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <label style={{ marginRight: 5 }}>Chart of Accounts:</label>
            <Select
              className="journalFormInputSelect"
              value={chartOfAccounts
                .map((coa) => ({
                  label: coa.name,
                  value: coa._id,
                }))
                .find((coa) => coa.value === selectedChartOfAccountsId)}
              onChange={handleChartOfAccountChange}
              options={chartOfAccounts.map((coa) => ({
                label: coa.name,
                value: coa._id,
              }))}
              styles={customSelectStyles}
            />
          </div>
        ) : null}
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
