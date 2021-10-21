import React, { useState, useEffect } from "react";
// Material UI
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { ClipLoader } from "react-spinners";
import { BLUE, RED } from "../../../constants";

const getModalStyle = () => {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    height: "50%",
    width: "30%",
    minWidth: 500,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

export const ConfirmChartOfAccountsUpdateModal = ({
  open,
  handleClose,
  selectedCoa,
  chartOfAccountsDataToConfirm,
  setEditedSelectedCoa,
}) => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();

  const [modalStyle] = useState(getModalStyle);
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleUpdate = () => {
    setUpdateLoading(true);

    Meteor.call(
      "chartOfAccounts.segments.update",
      selectedCoa._id,
      chartOfAccountsDataToConfirm.segments,
      (err, res) => {
        if (err) {
          console.log(err);
          alert(`Unable to update chart of accounts: ${err.reason}`);
        } else {
          setEditedSelectedCoa(res);
          handleClose();
        }

        setUpdateLoading(false);
      }
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div style={modalStyle} className={classes.paper}>
        <div style={{ fontWeight: "bold" }}>
          Are you sure you want to update {selectedCoa?.name}?
        </div>
        <div style={{ width: "50%" }}>
          <div>Rows Removed:</div>
          <div className="segmentsUpdateContainer">
            {chartOfAccountsDataToConfirm.subSegmentsRemoved.length > 0
              ? chartOfAccountsDataToConfirm.subSegmentsRemoved.map(
                  (subSegment, index) => (
                    <div
                      key={index}
                    >{`${subSegment.description} - ${subSegment.segmentId}`}</div>
                  )
                )
              : "None"}
          </div>
        </div>
        <div style={{ width: "50%" }}>
          <div>Rows Added:</div>
          <div className="segmentsUpdateContainer">
            {chartOfAccountsDataToConfirm.subSegmentsAdded.length > 0
              ? chartOfAccountsDataToConfirm.subSegmentsAdded.map(
                  (subSegment, index) => (
                    <div
                      key={index}
                    >{`${subSegment.description} - ${subSegment.segmentId}`}</div>
                  )
                )
              : "None"}
          </div>
        </div>
        <div style={{ width: "50%" }}>
          <div>Rows Updated:</div>
          <div className="segmentsUpdateContainer">
            {chartOfAccountsDataToConfirm.subSegmentsUpdated.length > 0
              ? chartOfAccountsDataToConfirm.subSegmentsUpdated.map(
                  (subSegment, index) => (
                    <div
                      key={index}
                    >{`${subSegment.description} - ${subSegment.segmentId}`}</div>
                  )
                )
              : "None"}
          </div>
        </div>
        {updateLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              height: 60,
              width: "70%",
            }}
          >
            <ClipLoader
              color={BLUE}
              loading={updateLoading}
              css={"margin-left: 0px; margin-top: 20px;"}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              height: 60,
              width: "70%",
            }}
          >
            <button
              className="updateChartOfAccountsButton"
              style={{
                marginTop: 20,
                marginLeft: 0,
                backgroundColor: BLUE,
              }}
              onClick={handleUpdate}
            >
              Update
            </button>
            <button
              className="updateChartOfAccountsButton"
              style={{ marginTop: 20, marginLeft: 0, backgroundColor: RED }}
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
