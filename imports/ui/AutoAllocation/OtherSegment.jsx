import React, { useState } from "react";

export const OtherSegment = ({
  segment,
  formData,
  handleChangeOtherSegments,
}) => {
  const [selectedSegment, setSelectedSegment] = useState(
    segment.subSegments[0]
  );
  const description = segment.description;

  const formDataOtherSegment = formData.otherSegments.find(
    (os) => os._id === segment._id
  );

  const handleChangeSegment = (e) => {
    const newSelectedSegment = segment.subSegments[e.target.value];
    setSelectedSegment(newSelectedSegment);

    handleChangeOtherSegments(
      segment._id,
      "selectedSubSegment",
      newSelectedSegment
    );
  };

  return (
    <div>
      <div className="formColumn">
        <label className="journalFormText">{description}</label>
        {formDataOtherSegment ? (
          <select
            value={segment.subSegments.findIndex(
              (subSegment) =>
                subSegment.segmentId ===
                formDataOtherSegment.selectedSubSegment.segmentId
            )}
            onChange={handleChangeSegment}
            className="journalFormInput"
            style={{ width: "10em" }}
          >
            {segment.subSegments.map((subSegment, index) => {
              return (
                <option key={index} value={index}>
                  {subSegment.segmentId} - {subSegment.description}
                </option>
              );
            })}
          </select>
        ) : null}
      </div>
      <div className="formColumn">
        <label className="journalFormText">Segment ID:</label>
        <div>{selectedSegment.segmentId}</div>
      </div>
    </div>
  );
};
