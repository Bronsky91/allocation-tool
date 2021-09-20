import React, { useState } from "react";
import { Redirect } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { useTracker } from "meteor/react-meteor-data";
// Components
import { Header } from "../Header";
// Material UI
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import { ClipLoader } from "react-spinners";
import { BLUE } from "../../../constants";

export const UserAccount = () => {
  // Subscriptions
  Meteor.subscribe("Meteor.user.details");

  const [updateLoading, setUpdateLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const user = useTracker(() => Meteor.user());
  const logout = () => {
    setLogoutLoading(true);
    Meteor.logout();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setUpdateLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;

    Meteor.call("user.name.update", name, (err, res) => {
      if (err) {
        alert(`Unable to update name: ${err.reason}`);
      }
      Meteor.call("user.email.update", email, (err, res) => {
        if (err) {
          alert(`Unable to update email: ${err.reason}`);
        }
        setUpdateLoading(false);
      });
    });
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
          <div className="userAccountName">{user.name}</div>
          {user.emails && user.emails.length > 0 ? (
            <div className="userAccountName" style={{ paddingTop: 5 }}>
              {user.emails[0].address}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="loginInputContainer" style={{ marginTop: 10 }}>
              <label className="loginText" htmlFor="name">
                Name
              </label>

              <input
                className="loginInput"
                type="text"
                name="name"
                required
                defaultValue={user.name}
              />
            </div>
            <div className="loginInputContainer">
              <label className="loginText" htmlFor="email">
                Email
              </label>
              <input
                className="loginInput"
                type="email"
                name="email"
                required
                defaultValue={
                  user.emails && user.emails.length > 0
                    ? user.emails[0].address
                    : ""
                }
              />
            </div>
            {updateLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  width: 322,
                }}
              >
                <ClipLoader
                  color={BLUE}
                  loading={updateLoading}
                  css={"margin-left: 10px; margin-top: 20px"}
                />
              </div>
            ) : (
              <button
                type="submit"
                className="loginButton"
                style={{ marginTop: 20, marginLeft: 0 }}
              >
                Update
              </button>
            )}
          </form>

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
              style={{ marginTop: 20, marginLeft: 0 }}
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
