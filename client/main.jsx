import React from "react";
// Meteor
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { render } from "react-dom";
import { App } from "/imports/ui/App";

Meteor.startup(() => {
  render(<AppContainer />, document.getElementById("react-target"));
});

// Reactive Container
const AppContainer = withTracker(() => ({
  loggingIn: Meteor.loggingIn(),
}))(App);
