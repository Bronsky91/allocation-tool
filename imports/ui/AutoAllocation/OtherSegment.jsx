import React, { useState } from "react";
import { SegmentSelect } from "./SegmentSelect";

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

  const handleChangeSegment = (selected) => {
    const newSelectedSegment = segment.subSegments[selected.value];
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
          <SegmentSelect
            value={segment.subSegments.findIndex(
              (subSegment) =>
                subSegment.segmentId ===
                formDataOtherSegment.selectedSubSegment.segmentId
            )}
            onChange={handleChangeSegment}
            subSegments={segment.subSegments}
          />
        ) : null}
      </div>
      <div className="formColumn">
        <label className="journalFormText">Segment ID:</label>
        <div>{selectedSegment.segmentId}</div>
      </div>
    </div>
  );
};
