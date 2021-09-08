import React, { useState, useEffect } from "react";
// Metor imports
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
// Material UI
import { IconButton } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
// React Packages
import { Redirect } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BarLoader from "react-spinners/BarLoader";
import Select from "react-select";
// Components
import { Header } from "../Header";
import { BalanceAccount } from "./BalanceAccount";
import { GLSegment } from "./GLSegment";
import { SubGLSegment } from "./SubGLSegment";
import { OtherSegment } from "./OtherSegment";
import { AllocateModal } from "./AllocateModal";
import { NestedAllocationModal } from "./NestedAllocationModal";
import { SaveTemplateModal } from "./SaveTemplateModal";
// DB
import { ChartOfAccountsCollection } from "../../db/ChartOfAccountsCollection";
// Utils
import { CreateWorkbook } from "../../utils/CreateWorkbook";
// Constants
import {
  BLUE,
  customSelectStyles,
  GL_CODE,
  SUB_GL_CODE,
} from "../../../constants";

export const JournalFormParent = () => {
  // Current user logged in
  const user = useTracker(() => Meteor.user());
  // Subscriptions
  Meteor.subscribe("chartOfAccounts");

  const chartOfAccounts = useTracker(() =>
    ChartOfAccountsCollection.find({}).fetch()
  );
  console.log("chartOfAccounts", chartOfAccounts);

  if (!user) {
    return <Redirect to="/login" />;
  }
  if (chartOfAccounts.length > 0) {
    // Ensures that the JournalForm as a chart of accounts to function properly
    return (
      <div>
        <JournalForm user={user} chartOfAccounts={chartOfAccounts} />
      </div>
    );
  }
  return (
    <div>
      <Header />
    </div>
  );
};

const JournalForm = ({ user, chartOfAccounts }) => {
  const [selectedChartOfAccountsId, setSelectChartOfAccountsId] = useState(
    chartOfAccounts[0]._id
  );
  const [selectedMetric, setSelectedMetric] = useState(
    chartOfAccounts[0].metrics[0]
  );

  const selectedChartOfAccounts = chartOfAccounts.find(
    (coa) => coa._id === selectedChartOfAccountsId
  );
  const segments = selectedChartOfAccounts.segments;
  const metrics = selectedChartOfAccounts.metrics;
  const allocations = selectedChartOfAccounts.metrics
    .map((m) => m._id)
    .includes(selectedMetric._id)
    ? selectedChartOfAccounts.metrics.find(
        (metric) => metric._id === selectedMetric._id
      ).allocations
    : [];
  const templates = selectedChartOfAccounts.templates;

  const GLSegmentNames = [GL_CODE, SUB_GL_CODE];
  const glCodeSegment = segments.find((s) => s.description === GL_CODE);
  const balanceAccountSegments = segments
    .filter((s) => s.description !== SUB_GL_CODE)
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);
  const subGLCodeSegment = segments.find((s) => s.description === SUB_GL_CODE);

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [editAllocationModalOpen, setEditAllocationModalOpen] = useState(false);
  const [nestedAllocationOpen, setNestedAllocationOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(allocations[0]);
  const [newestAllocationId, setNewestAllocationId] = useState();
  const [editedCurrentAllocation, setEditedCurrentAllocation] = useState();
  const [nestingAllocation, setNestingAllocation] = useState(false);
  const [showSubGLSegment, setShowSubGLSegment] = useState(false);
  const [selectedSubGLOption, setSelectedSubGLOption] = useState("balance");
  const [selectedSubGLSegment, setSelectedSubGLSegment] = useState(
    subGLCodeSegment.subSegments.find((s) => Number(s.segmentId) === 0)
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("0");
  const [fileLoading, setFileLoading] = useState(false);

  const metricSegments = segments
    .filter((s) => selectedMetric.metricSegments.includes(s.description))
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  const selectedTemplate = templates.find(
    (template) => template._id === selectedTemplateId
  );

  const [formData, setFormData] = useState({
    username: user.username,
    toBalanceSegmentValue: 0,
    selectedBalanceSegments: balanceAccountSegments.map((bas) => ({
      ...bas,
      selectedSubSegment: bas.subSegments[0],
    })),
    selectedAllocationSegment: glCodeSegment.subSegments[0],
    // selectedSubGLSegment
    subGLSegment: {
      balance: subGLCodeSegment.subSegments.find(
        (s) => Number(s.segmentId) === 0
      ),
      allocations: subGLCodeSegment.subSegments.find(
        (s) => Number(s.segmentId) === 0
      ),
    },
    otherSegments: [],
    journalDescription: "",
    entryDate: new Date(),
    typicalBalance: glCodeSegment.subSegments[0].typicalBalance
      ? glCodeSegment.subSegments[0].typicalBalance.toLowerCase()
      : "debit",
    allocationValueOfBalancePerChartField: {}, // Allocation calculations
    segments, // All segments, used here for creating the workbook
    metricSegments, // Used to dynamically create the chart order in workbook
  });

  const nonMetricSegments = segments.filter(
    (s) =>
      !selectedMetric.metricSegments.includes(s.description) &&
      !GLSegmentNames.includes(s.description)
  );

  const availableMethods = selectedMetric.columns.filter((c) =>
    selectedMetric.validMethods.includes(c.title)
  );

  const readyToAllocate =
    selectedAllocation &&
    formData.toBalanceSegmentValue > 0 &&
    formData.journalDescription.length > 0 &&
    Object.keys(formData.allocationValueOfBalancePerChartField).length > 0;

  const templateReady =
    selectedAllocation && formData.journalDescription.length > 0;

  const templateEdit = selectedTemplateId !== "0" && selectedTemplate;

  useEffect(() => {
    setSelectedMetric(
      chartOfAccounts.find((coa) => coa._id === selectedChartOfAccountsId)
        .metrics[0]
    );
  }, [selectedChartOfAccountsId]);

  useEffect(() => {
    // Populate the formData with
    const otherSegments = nonMetricSegments.map((segment) => ({
      _id: segment._id,
      description: segment.description,
      selectedSubSegment: segment.subSegments[0],
    }));

    handleChangeFormData("otherSegments", otherSegments);
  }, [selectedMetric]);

  useEffect(() => {
    // Select the first allocation when the selectedMetric changes
    setSelectedAllocation(allocations[0]);
  }, [selectedMetric]);

  useEffect(() => {
    // Select the first allocation when the allocations load
    if (allocations.length > 0 && !selectedAllocation) {
      setSelectedAllocation(allocations[0]);
    }
  }, [allocations]);

  useEffect(() => {
    // After a new allocation is created, make it the currently selected allocation in the dropdown
    if (
      newestAllocationId &&
      selectedAllocation &&
      selectedAllocation._id !== newestAllocationId
    ) {
      setSelectedAllocation(
        allocations.find((a) => a._id === newestAllocationId)
      );
    }
  }, [allocations]);

  useEffect(() => {
    // After a new allocation is edited, update the selectedAllocation state to reflect
    // This is required because the next time the user opens the edit modal we want the data to reflect their most recent changes
    if (
      selectedAllocation &&
      editedCurrentAllocation &&
      selectedAllocation.updatedAt !== editedCurrentAllocation
    ) {
      setSelectedAllocation(
        allocations.find((a) => a._id === selectedAllocation._id)
      );
      // Once the updated selectedAllocation state is refreshed, set the edit flag to undefined
      setEditedCurrentAllocation();
    }
  }, [allocations]);

  useEffect(() => {
    if (
      formData.journalDescription.length > 0 &&
      selectedAllocation &&
      formData.toBalanceSegmentValue > 0
    ) {
      Meteor.call(
        "calculateAllocation",
        {
          chartOfAccountsId: selectedChartOfAccountsId,
          subSegments: selectedAllocation.subSegments,
          method: selectedAllocation.method,
          toBalanceValue: formData.toBalanceSegmentValue,
          metricId: selectedMetric._id,
        },
        (err, allocationData) => {
          if (err) {
            console.log("err", err);
          } else {
            handleChangeFormData(
              "allocationValueOfBalancePerChartField",
              allocationData
            );
            setFileLoading(true);
          }
        }
      );
    }
  }, [
    formData.toBalanceSegmentValue,
    selectedAllocation,
    formData.journalDescription,
  ]);

  useEffect(() => {
    if (readyToAllocate) {
      setFileLoading(false);
    }
  }, [
    readyToAllocate,
    formData.allocationValueOfBalancePerChartField,
    formData.toBalanceSegmentValue,
  ]);

  useEffect(() => {
    if (selectedTemplate) {
      // TODO: WTF is this?
      console.log("New Selected Template", selectedTemplate);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedTemplateId !== "0" && selectedTemplate) {
      console.log("selectedTemplate", selectedTemplate);
      // Apply template to form
      setSelectedMetric(
        metrics.find((m) => m._id === selectedTemplate.metricToAllocate)
      );
      setSelectedAllocation(
        allocations.find((a) => a._id === selectedTemplate.allocationTechinque)
      );
      setNestingAllocation(selectedTemplate.nestThisAllocation);

      setFormData((formData) => ({
        ...formData,
        journalDescription: selectedTemplate.description,
        selectedBalanceSegments: formData.selectedBalanceSegments.map(
          (sbs, index) => ({
            ...sbs,
            selectedSubSegment: selectedTemplate.balancingAccount[index],
          })
        ),
        selectedAllocationSegment:
          selectedTemplate.glCodeToAllocate.allocationSegment,
        typicalBalance: selectedTemplate.glCodeToAllocate.typicalBalance,
        otherSegments: formData.otherSegments.map((os, index) => ({
          ...os,
          selectedSubSegment: selectedTemplate.otherSegments[index], // TODO: TEST THIS!
        })),
        subGLSegment: selectedTemplate.subGLCode.subGLSegment,
      }));

      setSelectedSubGLSegment(selectedTemplate.subGLCode.selectedSubGLSegment);
      setShowSubGLSegment(selectedTemplate.subGLCode.showSubGLSegment);
      setSelectedSubGLOption(selectedTemplate.subGLCode.selectedSubGLOption);
    }
  }, [selectedTemplateId]);

  const handleChangeFormData = (field, value) => {
    setFormData((formData) => ({
      ...formData,
      [field]: value,
    }));
  };

  const handleChangeOtherSegments = (segmentID, field, value) => {
    setFormData((formData) => ({
      ...formData,
      otherSegments: formData.otherSegments.map((segment) => {
        if (segment._id === segmentID) {
          return {
            ...segment,
            [field]: value,
          };
        }
        return segment;
      }),
    }));
  };

  const handleDeleteAllocation = (e) => {
    // Gets current index of selected allocation in the allocations array
    const currentIndex = allocations.findIndex(
      (a) => a._id === selectedAllocation._id
    );
    // Removes the selected Allocation from the database
    Meteor.call(
      "chartOfAccounts.metrics.allocations.remove",
      selectedChartOfAccountsId,
      selectedMetric._id,
      selectedAllocation._id,
      (err, res) => {
        if (err) {
          console.log("Error Deleting Allocation", err);
          alert(err);
        } else {
          console.log("Deleted Alloction", res);
        }
      }
    );
    // Moves the next selectedAllocation down one index, unless it's already 0 then keep it 0
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    setSelectedAllocation(allocations[nextIndex]);
  };

  const handleMetricChange = (selected) => {
    const newMetricSelected = metrics.find(
      (metric) => metric._id === selected.value
    );
    setSelectedMetric(newMetricSelected);
  };

  const handleAllocationChange = (selected) => {
    const newAllocationSelected = allocations.find(
      (allocation) => allocation._id === selected.value
    );
    setSelectedAllocation(newAllocationSelected);
  };

  const openAllocationModal = () => {
    // Opens Allocation Modal
    setAllocationModalOpen(true);
  };

  const closeAllocationModal = () => {
    // Close Allocation Modal
    setAllocationModalOpen(false);
  };

  const openEditAllocationModal = () => {
    // Opens Edit Allocation Modal
    setEditAllocationModalOpen(true);
  };

  const closeEditAllocationModal = () => {
    // Close Edit Allocation Modal
    setEditAllocationModalOpen(false);
  };

  const openNestedAllocationModal = () => {
    // Opens Nested Allocation Modal
    setNestedAllocationOpen(true);
  };

  const closeNestedAllocationModal = () => {
    // Close Nested Allocation Modal
    setNestedAllocationOpen(false);
  };

  const openSaveTemplateModal = () => {
    setSaveTemplateOpen(true);
  };

  const closeSaveTemplateModal = () => {
    setSaveTemplateOpen(false);
  };

  const closeNestedAllocationWithSelection = (selectionData) => {
    closeNestedAllocationModal();
    // Populate Form with new Nested Allocation Selection Data
    handleChangeFormData("toBalanceSegmentValue", selectionData.value);
    handleChangeFormData(
      "selectedBalanceSegments",
      balanceAccountSegments.map((bas) => {
        return {
          ...bas,
          selectedSubSegment: bas.subSegments.find(
            (subSegment) =>
              subSegment.segmentId.toString() ===
              selectionData.chartField[bas.chartFieldOrder]
          ),
        };
      })
    );
    // If there are subaccounts
    if (subGLCodeSegment) {
      // Segment ID of subaccount
      const subGLCode =
        selectionData.chartField[subGLCodeSegment.chartFieldOrder];

      if (showSubGLSegment) {
        // If the sub GL code was selected
        if (selectedSubGLOption === "allocations") {
          // If the sub GL was used for allocation, switch to balance
          setSelectedSubGLOption("balance");
        } else if (selectedSubGLOption === "balance") {
          // If the sub GL was used for balance, don't use any subGL codes (uncheck option)
          setShowSubGLSegment(false);
        }
      }
    }
  };

  const createTemplateObject = (name) => {
    return {
      name,
      description: formData.journalDescription,
      balancingAccount: formData.selectedBalanceSegments.map(
        (sbs) => sbs.selectedSubSegment
      ),
      glCodeToAllocate: {
        allocationSegment: formData.selectedAllocationSegment,
        typicalBalance: formData.typicalBalance,
      },
      otherSegments: formData.otherSegments.map((os) => os.selectedSubSegment), // TODO: TEST THIS!
      subGLCode: {
        subGLSegment: formData.subGLSegment,
        showSubGLSegment,
        selectedSubGLOption,
        selectedSubGLSegment,
      },
      metricToAllocate: selectedMetric._id,
      allocationTechinque: selectedAllocation._id,
      nestThisAllocation: nestingAllocation,
    };
  };

  const saveTemplate = (name) => {
    const template = createTemplateObject(name);

    console.log("template", template);

    if (templateEdit) {
      Meteor.call(
        "chartOfAccounts.templates.update",
        selectedChartOfAccountsId,
        selectedTemplateId,
        template,
        (err, res) => {
          if (err) {
            console.log(err);
            alert("Unable to save template", err);
          } else {
            // TODO: Decide if the modal should still close if the save failed
            // TODO: Loading indicator
            console.log(res);
            if (res.numberOfDocumentsUpdate > 0) {
              closeSaveTemplateModal();
            }
          }
        }
      );
    } else {
      Meteor.call(
        "chartOfAccounts.templates.insert",
        selectedChartOfAccountsId,
        template,
        (err, res) => {
          if (err) {
            console.log(err);
            alert("Unable to save template", err);
          } else {
            // TODO: Decide if the modal should still close if the save failed
            // TODO: Loading indicator
            console.log(res);
            if (res.numberOfDocumentsUpdate > 0) {
              closeSaveTemplateModal();
              setSelectedTemplateId(res.templateId);
            }
          }
        }
      );
    }
  };

  const createJournalEntry = () => {
    if (nestingAllocation) {
      // Show Nesting Modal
      openNestedAllocationModal();
    }
    console.log(formData);
    CreateWorkbook(formData);
  };

  return (
    <div className="journalFormParent">
      <Header
        selectedChartOfAccountsId={selectedChartOfAccountsId}
        setSelectChartOfAccountsId={setSelectChartOfAccountsId}
      />
      <div className="journalFormMain">
        <AllocateModal
          open={allocationModalOpen} // Required
          handleClose={closeAllocationModal} // Required
          metricSegments={metricSegments} // Required, used for listing segments and subsegments
          selectedChartOfAccounts={selectedChartOfAccounts} // Required, used to save the allocation to the selected Technique
          selectedMetric={selectedMetric} // Required, used to save the allocation to the selected Technique
          availableMethods={availableMethods} // Required, used for listing which method options to use
          setNewestAllocationId={setNewestAllocationId} // Set the newest allocation created as selected in the dropdown
        />
        <AllocateModal
          open={editAllocationModalOpen} // Required
          handleClose={closeEditAllocationModal} // Required
          metricSegments={metricSegments} // Required, used for listing segments and subsegments
          selectedChartOfAccounts={selectedChartOfAccounts} // Required, used to save the allocation to the selected Technique
          selectedMetric={selectedMetric} // Required, used to save the allocation to the selected Technique
          availableMethods={availableMethods} // Required, used for listing which method options to use
          currentAllocation={selectedAllocation} // Used to edit the currently selected allocation
          setEditedCurrentAllocation={setEditedCurrentAllocation} // Set the edited allocation as selected in the dropdown to refresh with new data
        />
        <NestedAllocationModal
          open={nestedAllocationOpen}
          handleClose={closeNestedAllocationModal}
          data={formData}
          handleCloseComplete={closeNestedAllocationWithSelection}
        />
        <SaveTemplateModal
          open={saveTemplateOpen}
          handleClose={closeSaveTemplateModal}
          handleCloseComplete={saveTemplate}
          selectedTemplate={selectedTemplate}
        />
        <div className="journalFormContainer">
          <div className="journalFormContainerRow">
            <div className="journalFormMetaContainer">
              <div className="journalFormTitle">Journal Entry Information</div>
              <div className="formRow">
                <div className="formColumn">
                  <label className="journalFormText">Description</label>
                  <input
                    type="text"
                    onChange={(e) =>
                      handleChangeFormData("journalDescription", e.target.value)
                    }
                    style={{ width: "20em", height: "1.5em" }}
                    className="journalFormInputLarge"
                    value={formData.journalDescription}
                  />
                </div>
              </div>
              <div className="formRow" style={{ alignItems: "center" }}>
                <div className="formColumn">
                  <label className="journalFormText">Entry Date:</label>
                  <div>
                    <DatePicker
                      selected={formData.entryDate}
                      onChange={(date) =>
                        handleChangeFormData("entryDate", date)
                      }
                      className="journalFormInput"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="formRow">
              <div className="column">
                <label className="journalFormText">
                  Select Saved Template:
                </label>
                <div className="formRow" style={{ alignItems: "center" }}>
                  <Select
                    className="journalFormInputSelect"
                    value={
                      selectedChartOfAccounts.templates
                        .map((template) => ({
                          label: template.name,
                          value: template._id,
                        }))
                        .find(
                          (template) => template.value === selectedTemplateId
                        ) || { value: "0", label: "No Template" }
                    }
                    onChange={(selected) =>
                      setSelectedTemplateId(selected.value)
                    }
                    options={[
                      { value: "0", label: "No Template" },
                      ...selectedChartOfAccounts.templates.map((template) => ({
                        label: template.name,
                        value: template._id,
                      })),
                    ]}
                    defaultValue={{ value: "0", label: "No Template" }}
                    styles={customSelectStyles}
                  />
                  <IconButton
                    color="inherit"
                    onClick={openSaveTemplateModal}
                    style={{ color: "#3597fe" }}
                  >
                    <AddIcon fontSize="default" />
                  </IconButton>
                  {/* <button
                    className={`journalFormSaveTemplateButton ${
                      !templateReady ? "buttonDisabled" : ""
                    }`}
                    onClick={() => openSaveTemplateModal()}
                    disabled={!templateReady}
                  >
                    {templateEdit ? "Update Template" : "Save new Template"}
                  </button> */}
                </div>
              </div>
            </div>
          </div>
          <div className="journalFormContainerRow">
            <div className="journalAccountParentContainer">
              <div
                className="journalFormBalanceContainer journalAccountContainer"
                // style={{ border: "0.5px green solid" }}
              >
                <BalanceAccount
                  handleChangeFormData={handleChangeFormData}
                  formData={formData}
                />
              </div>
            </div>
            <div className="journalFormMetricAllocationContainer">
              <div className="formColumn">
                <label className="journalFormText">
                  Select Metric to Allocate with:
                </label>
                <Select
                  value={metrics
                    .map((metric) => ({
                      value: metric._id,
                      label: metric.description,
                    }))
                    .find((metric) => metric.value === selectedMetric._id)}
                  onChange={handleMetricChange}
                  className="journalFormInputSelect"
                  options={metrics.map((metric) => ({
                    value: metric._id,
                    label: metric.description,
                  }))}
                  styles={customSelectStyles}
                />
              </div>

              {allocations.length > 0 ? (
                <div className="formColumn" style={{ marginTop: "12px" }}>
                  <label className="journalFormText">
                    Select Allocation Technique:
                  </label>
                  <div
                    className="formRow"
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <Select
                      value={allocations
                        .map((allocation) => ({
                          value: allocation._id,
                          label: allocation.name,
                        }))
                        .find(
                          (allocation) =>
                            allocation.value === selectedAllocation?._id
                        )}
                      onChange={handleAllocationChange}
                      className="journalFormInputSelect"
                      options={allocations.map((allocation) => ({
                        value: allocation._id,
                        label: allocation.name,
                      }))}
                      styles={customSelectStyles}
                    />
                    <IconButton
                      color="inherit"
                      onClick={openAllocationModal}
                      style={{ color: "#3597fe" }}
                    >
                      <AddIcon fontSize="default" />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      onClick={openEditAllocationModal}
                      disabled={!selectedAllocation}
                      style={{ color: "#60cead" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      onClick={handleDeleteAllocation}
                      disabled={!selectedAllocation}
                      style={{ color: "#f54747" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              ) : (
                <button
                  onClick={openAllocationModal}
                  className="journalFormAllocationButton"
                >
                  Create new Allocation Technique
                </button>
              )}
            </div>
          </div>

          <div className="journalFormContainerRow">
            <div className="journalAccountParentContainer">
              <div
                className="journalAccountContainer"
                // style={{ border: "0.5px blue solid" }}
              >
                <GLSegment
                  glCodeSegment={glCodeSegment}
                  formData={formData}
                  handleChangeFormData={handleChangeFormData}
                />
                {subGLCodeSegment ? (
                  <SubGLSegment
                    subGLCodeSegment={subGLCodeSegment}
                    formData={formData}
                    handleChangeFormData={handleChangeFormData}
                    selectedSegment={selectedSubGLSegment}
                    setSelectedSegment={setSelectedSubGLSegment}
                    showSubGLSegment={showSubGLSegment}
                    setShowSubGLSegment={setShowSubGLSegment}
                    selectedOption={selectedSubGLOption}
                    setSelectedOption={setSelectedSubGLOption}
                  />
                ) : null}
              </div>
            </div>
            <div className="journalFormDownloadContainer">
              {!readyToAllocate || fileLoading ? (
                <div className="journalFormDownloadInnerContainer">
                  <div className="journalFormText">
                    When your journal entry file is ready it will be available
                    for download here
                  </div>
                  <BarLoader loading={fileLoading} color={BLUE} />
                  <div></div>
                </div>
              ) : null}
              {readyToAllocate && !fileLoading ? (
                <div className="journalFormDownloadInnerContainer">
                  <div className="journalFormText">
                    Your file is ready, click download button below to download
                    your journal entry
                  </div>

                  <button
                    onClick={createJournalEntry}
                    className="journalFormDownloadButton"
                    disabled={!readyToAllocate}
                  >
                    <GetAppIcon />
                    Download
                  </button>
                  <div className="formColumn">
                    <div>
                      <input
                        type="checkbox"
                        onChange={(e) => setNestingAllocation(e.target.checked)}
                        checked={nestingAllocation}
                      />
                      <label className="journalFormText">
                        Nest this Allocation?
                      </label>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="journalFormContainerRow">
            {nonMetricSegments.length > 0 ? (
              <div className="journalAccountContainer">
                <div className="journalFormTitle">Unused Allocation Fields</div>
                {nonMetricSegments.map((segment, index) => (
                  <OtherSegment
                    key={index}
                    segment={segment}
                    formData={formData}
                    handleChangeOtherSegments={handleChangeOtherSegments}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
