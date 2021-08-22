import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
// db
import { ChartOfAccountsCollection } from "../db/ChartOfAccountsCollection";
// constants
import { CHART_OF_ACCOUNT_COLUMNS, VALID_COLUMN_NAMES } from "../../constants";

Meteor.methods({
  "chartOfAccounts.insert": function (name) {
    check(name, String);

    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }

    return ChartOfAccountsCollection.insert({
      name,
      userId: this.userId,
      segments: [],
      metrics: [],
      templates: [],
    });
  },
  "chartOfAccounts.removeAll": function () {
    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }
    return ChartOfAccountsCollection.remove({});
  },
  "chartOfAccounts.segments.insert": function (id, workbookData) {
    check(id, String);
    check(workbookData, {
      sheets: [
        {
          columns: [String],
          id: Number,
          name: String,
          rows: [[{ rowNumber: Number, value: Match.OneOf(String, Number) }]],
        },
      ],
    });

    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }

    for (const [index, sheet] of workbookData.sheets.entries()) {
      const description = sheet.name;
      const chartFieldOrder = index;
      // Columns object that matches the columns to it's index in the sheet to be inserted properly in the rows map
      const columnIndexRef = sheet.columns.reduce(
        (columnIndexRefObj, columnName, i) => {
          // If the column in the sheet is valid for processing, add it to the object
          if (VALID_COLUMN_NAMES.includes(columnName)) {
            return {
              ...columnIndexRefObj,
              [i]: CHART_OF_ACCOUNT_COLUMNS[columnName],
            };
          }
          // Otherwise return the object as-is and continue
          return columnIndexRefObj;
        },
        {}
      );

      const subSegments = sheet.rows
        .filter((row) => row.length > 1)
        .map((row) => {
          const subSegment = {};
          row.map((r, i) => {
            subSegment[columnIndexRef[i]] = r.value;
          });
          return subSegment;
        });

      ChartOfAccountsCollection.update(
        { _id: id },
        {
          $push: {
            segments: {
              _id: new Mongo.ObjectID()._str,
              description,
              subSegments,
              chartFieldOrder,
              userId: this.userId,
              createdAt: new Date(),
            },
          },
        }
      );
    }
  },
  "chartOfAccounts.segments.removeAll": function (id) {
    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }
    ChartOfAccountsCollection.update(
      { _id: id },
      {
        $set: {
          segments: [],
        },
      }
    );
  },
  "chartOfAccounts.metrics.insert": function (id, data) {
    check(id, String);
    check(data, {
      columns: [String],
      id: Number,
      name: String,
      metricSegments: [String], // metricSegments - Array of column names that are linked to Segments
      validMethods: [String], // validMethods - Array of column names that are used for allocation
      rows: [[{ rowNumber: Number, value: Match.OneOf(String, Number) }]],
    });

    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }

    const description = data.name;
    const columnNames = data.columns;
    const validMethods = data.validMethods;
    const metricSegments = data.metricSegments;
    const columns = columnNames.map((cn, index) => ({
      title: cn,
      rows: data.rows.map((row) => {
        return row[index];
      }),
    }));

    ChartOfAccountsCollection.update(
      { _id: id },
      {
        $push: {
          metrics: {
            _id: new Mongo.ObjectID()._str,
            description,
            columns,
            validMethods,
            metricSegments,
            userId: this.userId,
            createdAt: new Date(),
            allocations: [],
          },
        },
      }
    );
  },
  "chartOfAccounts.metrics.removeAll": function (id) {
    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }
    ChartOfAccountsCollection.update(
      { _id: id },
      {
        $set: {
          metrics: [],
        },
      }
    );
  },
  "chartOfAccounts.metrics.allocations.insert": function (
    chartOfAccountId,
    metricId,
    name,
    subSegments,
    method
  ) {
    check(chartOfAccountId, String);
    check(metricId, String);
    check(name, String);
    check(subSegments, [
      { segmentName: String, subSegmentIds: [Match.OneOf(String, Number)] },
    ]);
    check(method, String);

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }
    const allocationId = new Mongo.ObjectID()._str;

    const numberOfDocumentsUpdate = ChartOfAccountsCollection.update(
      { _id: chartOfAccountId, "metrics._id": metricId },
      {
        $push: {
          "metrics.$.allocations": {
            _id: allocationId,
            name,
            subSegments,
            method,
            metricId,
            userId: this.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      }
    );
    return { allocationId, numberOfDocumentsUpdate };
  },
  "chartOfAccounts.metrics.allocations.update": function (
    chartOfAccountId,
    metricId,
    currentAllocation,
    name,
    subSegments,
    method
  ) {
    check(chartOfAccountId, String);
    check(currentAllocation, {
      _id: String,
      name: String,
      subSegments: [
        { segmentName: String, subSegmentIds: [Match.OneOf(String, Number)] },
      ],
      method: String,
      metricId: String,
      userId: String,
      createdAt: Date,
      updatedAt: Date,
    });
    check(name, String);
    check(subSegments, [
      { segmentName: String, subSegmentIds: [Match.OneOf(String, Number)] },
    ]);
    check(method, String);

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    const updatedAt = new Date();

    ChartOfAccountsCollection.update(
      { _id: chartOfAccountId },
      {
        $set: {
          "metrics.$[m].allocations.$[a]": {
            ...currentAllocation,
            name,
            subSegments,
            method,
            updatedAt,
          },
        },
      },
      {
        arrayFilters: [
          { "m._id": metricId },
          { "a._id": currentAllocation._id },
        ],
      }
    );

    return updatedAt;
  },
  "chartOfAccounts.metrics.allocations.remove": function (
    chartOfAccountId,
    metricId,
    allocationId
  ) {
    check(chartOfAccountId, String);
    check(metricId, String);
    check(allocationId, String);

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    return ChartOfAccountsCollection.update(
      { _id: chartOfAccountId, "metrics._id": metricId },
      {
        $pull: {
          "metrics.$.allocations": { _id: allocationId },
        },
      }
    );
  },
  'chartOfAccounts.templates.insert': function (id, template) {
    check(id, String);
    check(template, {
      name: String,
      description: String,
      balancingAccount: [String],
      glCodeToAllocate: {
        allocationSegment: {
          category: String,
          description: String,
          segmentId: Match.OneOf(String, Number),
          typicalBalance: String
        },
        typicalBalance: String
      },
      otherSegments: Match.Maybe([String]),
      subGLCode: {
        subGLSegment: {
          allocations: {
            description: String,
            segmentId: Match.OneOf(String, Number)
          },
          balance: {
            description: String,
            segmentId: Match.OneOf(String, Number)
          }
        },
        selectedSubGLOption: String,
        showSubGLSegment: Boolean,
      },
      metricToAllocate: String,
      allocationTechinque: String,
      nestThisAllocation: Boolean,
    });

    if (!this.userId) {
      // TODO: Add proper permissions
      throw new Meteor.Error("Not authorized.");
    }
    const templateId = new Mongo.ObjectID()._str;

    const numberOfDocumentsUpdate = ChartOfAccountsCollection.update(
      { _id: id },
      {
        $push: {
          templates: {
            _id: templateId,
            ...template
          },
        },
      }
    );
    return { templateId, numberOfDocumentsUpdate };
  }
});
