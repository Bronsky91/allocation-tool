import { Meteor } from "meteor/meteor";
import { SegmentsCollection } from "/imports/api/segments";

function insertSegment({ description, subSegments, type, chartFieldOrder }) {
  SegmentsCollection.insert({
    description,
    subSegments,
    type,
    chartFieldOrder,
    createdAt: new Date(),
  });
}

Meteor.startup(() => {
  // If the Segments collection is empty, add some data.
  if (SegmentsCollection.find().count() === 0) {
    insertSegment({
      description: "Main Account",
      subSegments: [
        { title: "Payroll", number: 6100 },
        { title: "Rent", number: 6200 },
      ],
      type: "MAIN",
      chartFieldOrder: 2,
    });

    insertSegment({
      description: "Location",
      subSegments: [
        { title: "Tucson", number: 10 },
        { title: "Tempe", number: 20 },
        { title: "QC", number: 30 },
        { title: "Mesa", number: 40 },
      ],
      type: "STANDARD",
      chartFieldOrder: 0,
    });

    insertSegment({
      description: "Cost Center",
      subSegments: [
        { title: "Sales", number: 1 },
        { title: "Marketing", number: 2 },
        { title: "Ops", number: 3 },
      ],
      type: "STANDARD",
      chartFieldOrder: 1,
    });

    insertSegment({
      description: "Sub-Account",
      subSegments: [{ title: "Nate's Favorite", number: 0001 }],
      type: "STANDARD",
      chartFieldOrder: 3,
    });

    insertSegment({
      description: "Offset Account",
      subSegments: [
        { title: "Cash", number: 1000 }, // Should be 00-0-1000-0000 at the end
        { title: "Accounts Receivable", number: 2000 },
      ],
      type: "OFFSET",
    });
  }
});
