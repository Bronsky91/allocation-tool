import React, { useState } from "react";
import { Redirect } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// DB Collections
import { SegmentsCollection } from "../../db/SegmentsCollection";
import { MetricsCollection } from "../../db/MetricsCollection";
// Components
import { Header } from "../Header";
// Material UI
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";

export const UserAccount = () => {
  const user = useTracker(() => Meteor.user());
  const logout = () => Meteor.logout();

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="userAccountParentContainer">
      <Header />
      <div className="userAccountContainer">
        <div className="userAccountInnerContainer">
          <div className="userAccountImageContainer">
            <PersonOutlineIcon style={{ color: "white" }} />
          </div>
          <div class="userAccountName">{user.username}</div>
          <div className="loginInputContainer" style={{ marginTop: 10 }}>
            <label className="loginText" htmlFor="name">
              Name
            </label>

            <input className="loginInput" type="text" name="name" required />
          </div>
          <div className="loginInputContainer">
            <label className="loginText" htmlFor="email">
              Email
            </label>
            <input className="loginInput" type="email" name="email" required />
          </div>
          <div className="loginInputContainer">
            <label className="loginText" htmlFor="password">
              Change Password
            </label>
            <input
              className="loginInput"
              type="password"
              name="password"
              required
            />
          </div>
          <button
            type="submit"
            className="loginButton"
            style={{ marginTop: 20 }}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};
