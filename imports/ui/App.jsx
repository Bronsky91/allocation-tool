import React, { useState } from "react";
import { JournalForm } from "./AutoAllocation/JournalForm.jsx";
import { JournalFormManual } from "./ManualEntry/JournalFormManual.jsx";
import { ImportData } from "./Onboarding/ImportData.jsx";

export const App = () => {
  const [selectedPage, setSelectedPage] = useState("import");

  const handlePageSelection = () => {};

  const pages = {
    import: <ImportData />,
    manual: <JournalFormManual />,
    auto: <JournalForm />,
  };

  return (
    <div>
      <h1 className="center">DOPE CHODE JOURNAL ENTRY!</h1>
      <div className="center">
        <button
          className="headerButton"
          onClick={() => setSelectedPage("import")}
        >
          Import/Onboard
        </button>
        <button
          className="headerButton"
          onClick={() => setSelectedPage("manual")}
        >
          Manual Journal Entry
        </button>
        <button
          className="headerButton"
          onClick={() => setSelectedPage("auto")}
        >
          Auto Allocate Journal
        </button>
      </div>
      {pages[selectedPage]}
    </div>
  );
};
