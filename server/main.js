import { Meteor } from "meteor/meteor";
import { SegmentsCollection } from "/imports/api/Segments";

Meteor.methods({
  insertSegment: ({ description, subSegments, chartFieldOrder }) => {
    console.log("description", description);
    console.log("subSegments", subSegments);
    console.log("chartFieldOrder", chartFieldOrder);

    SegmentsCollection.insert({
      description,
      subSegments,
      chartFieldOrder,
      createdAt: new Date(),
    });
  },
});

Meteor.startup(() => {});
