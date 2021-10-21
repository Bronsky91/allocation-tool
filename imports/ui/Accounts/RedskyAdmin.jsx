import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Components
import { Header } from "../Header";

export const RedskyAdmin = () => {
  Meteor.subscribe("userListRedsky");

  const user = useTracker(() => Meteor.user());
  const allUsers = useTracker(() => Meteor.users.find({}, {}).fetch());

  // TODO: Probably should filter out users that don't have adminIds (meaning that their admin created)
  const history = useHistory();

  if (!user) {
    return <Redirect to="/login" />;
  }

  console.log(
    "users",
    allUsers.filter((user) => !user.adminId && !user.redskyAdmin)
  );

  const UserComponent = ({ user }) => {
    const [userDetails, setUserDetails] = useState({
      admin: user.admin,
      metricLimit: user.metricLimit,
      userLimit: user.userLimit,
    });

    const handleUserDetailsChange = (field, value) => {
      setUserDetails((userDetails) => ({
        ...userDetails,
        [field]: value,
      }));
    };

    return (
      <ul>
        <li>{user.name}</li>
        <ul>
          <li>
            Client Admin:
            <input
              type="checkbox"
              onChange={(e) =>
                handleUserDetailsChange("admin", e.target.checked)
              }
              checked={userDetails.admin}
            />
          </li>
          <li>
            # of Metrics allowed:
            <input
              type="number"
              value={userDetails.metricLimit}
              onChange={(e) =>
                handleUserDetailsChange("metricLimit", Number(e.target.value))
              }
              style={{ width: 50 }}
            ></input>
          </li>
          <li>
            # of Users allowed:
            <input
              type="number"
              value={userDetails.userLimit}
              onChange={(e) =>
                handleUserDetailsChange("userLimit", Number(e.target.value))
              }
              style={{ width: 50 }}
            ></input>
          </li>
          <button
            onClick={() => {
              Meteor.call(
                "user.admin.update",
                user._id,
                userDetails,
                (err, res) => {
                  if (err) {
                    console.log(err);
                    alert(err.reason);
                  } else {
                    alert(`User saved!`);
                  }
                }
              );
            }}
          >
            Save
          </button>
        </ul>
      </ul>
    );
  };

  return (
    <div>
      <Header />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        Welcome to the super secret Redsky admin page
        <div style={{ marginTop: 10 }}>
          User List
          {allUsers
            .filter((user) => !user.adminId && !user.redskyAdmin)
            .map((user, index) => (
              <UserComponent user={user} key={index} />
            ))}
        </div>
      </div>
    </div>
  );
};
