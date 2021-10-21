import React from "react";

import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Router
import { useHistory, useLocation } from "react-router-dom";
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
  // Subscriptions
  Meteor.subscribe("chartOfAccounts");
  Meteor.subscribe("Meteor.user.admin");
  Meteor.subscribe("Meteor.user.details");

  // Current user logged in
  const user = useTracker(() => Meteor.user());

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

  const getHeaderButtonContainerWidth = () => {
    if (location.pathname === "/" && chartOfAccounts.length > 0) {
      if (user && user?.admin) {
        return "400px";
      }
      return "350px";
    }
    if (user && user?.admin) {
      return "82px";
    }
    return "30px";
  };

  return (
    <div className="headerContainer">
      <div
        className="headerButtonContainer"
        style={{ width: getHeaderButtonContainerWidth() }}
      ></div>
      <div
        className="headerText"
        onClick={() => {
          if (chartOfAccounts.length === 0 && user.admin) {
            handleNavigation("/import");
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
        style={{ width: getHeaderButtonContainerWidth() }}
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
              value={
                chartOfAccounts
                  .map((coa) => ({
                    label: coa.name,
                    value: coa._id,
                  }))
                  .find((coa) => coa.value === selectedChartOfAccountsId) ||
                null
              }
              onChange={handleChartOfAccountChange}
              options={chartOfAccounts.map((coa) => ({
                label: coa.name,
                value: coa._id,
              }))}
              styles={customSelectStyles}
            />
          </div>
        ) : null}
        {user?.admin ? (
          <button
            className="headerButton"
            onClick={() => handleNavigation("/settings")}
          >
            <SettingsIcon color="action" fontSize="small" />
          </button>
        ) : null}
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
