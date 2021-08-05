import React, { useState } from "react";
// Meteor
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

export const UserAccount = () => {
  const user = useTracker(() => Meteor.user());
  console.log(user);
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      User Account Page for {user.username}
    </div>
  );
};
