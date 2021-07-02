import { Meteor } from "meteor/meteor";
import React, { useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { JournalForm } from "./AutoAllocation/JournalForm.jsx";
import { JournalFormManual } from "./ManualEntry/JournalFormManual.jsx";
import { ImportData } from "./Onboarding/ImportData.jsx";
import { LoginForm } from "./Accounts/LoginForm.jsx";

export const App = () => {
  const user = useTracker(() => Meteor.user());
  const logout = () => Meteor.logout();

  const [selectedPage, setSelectedPage] = useState("import");

  const pages = {
    import: <ImportData />,
    manual: <JournalFormManual />,
    auto: <JournalForm />,
  };

  return (
    <div>
      {user ? (
        <div>
          <div className="user">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>
                Currently logged in as:
                <span style={{ paddingLeft: 5, fontWeight: "bold" }}>
                  {user.username}
                </span>
              </div>
              <button
                style={{ width: "5em", alignSelf: "center", marginTop: "1em" }}
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
          <h1 className="center">JOURNAL ENTRY!</h1>
          <div className="center">
            <button
              className="mediumButton"
              onClick={() => setSelectedPage("import")}
            >
              Import/Onboard
            </button>
            {/*  
        **DEPRECATED**
        <button
          className="mediumButton"
          onClick={() => setSelectedPage("manual")}
        >
          Manual Journal Entry
        </button> 
        */}
            <button
              className="mediumButton"
              onClick={() => setSelectedPage("auto")}
            >
              Auto Allocate Journal
            </button>
          </div>
          {pages[selectedPage]}
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};
