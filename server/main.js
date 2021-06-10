import { Meteor } from "meteor/meteor";
import { SegmentsCollection } from "/imports/api/segments";

function insertSegment({ description, subSegments }) {
  SegmentsCollection.insert({
    description,
    subSegments,
    createdAt: new Date(),
  });
}

Meteor.startup(() => {
  // If the Segments collection is empty, add some data.
  if (SegmentsCollection.find().count() === 0) {
    insertSegment({
      description: "Main Account",
      subSegments: [{ title: "Expense", number: 6000 }],
      isMain: true,
    });

    insertSegment({
      description: "Location",
      subSegments: [
        { title: "Tucson", number: 10 },
        { title: "Tempe", number: 20 },
        { title: "QC", number: 30 },
        { title: "Mesa", number: 40 },
      ],
      isMain: false,
    });

    insertSegment({
      description: "Cost Center",
      subSegments: [
        { title: "Sales", number: 1 },
        { title: "Marketing", number: 2 },
        { title: "Ops", number: 3 },
      ],
      isMain: false,
    });

    insertSegment({
      description: "Sub-Account",
      subSegments: [{ title: "Nate's Favorite", number: 0001 }],
    });
    isMain: false;
  }
});
