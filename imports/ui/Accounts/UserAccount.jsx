import React, { useState } from "react";
import { Redirect } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Components
import { Header } from "../Header";
// Material UI
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import { ClipLoader } from "react-spinners";
import { BLUE } from "../../../constants";

export const UserAccount = () => {
  const [updateLoading, setUpdateLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const user = useTracker(() => Meteor.user());
  const logout = () => {
    setLogoutLoading(true);
    Meteor.logout();
  };

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
          <div className="userAccountName">{user.username}</div>
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
          {logoutLoading ? (
            <ClipLoader
              color={BLUE}
              loading={logoutLoading}
              css={"margin-left: 10px; margin-top: 20px"}
            />
          ) : (
            <button
              type="submit"
              className="loginButton"
              style={{ marginTop: 20 }}
              onClick={logout}
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
