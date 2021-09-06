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
  "chartOfAccounts.segments.insert": function (id, segments) {
    check(id, String);
    check(segments, [
      {
        chartFieldOrder: Number,
        description: String,
        subSegments: [
          {
            description: String,
            segmentId: Match.OneOf(String, Number),
            category: Match.Optional(String),
            typicalBalance: Match.Optional(String),
          },
        ],
      },
    ]);

    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }

    for (const segment of segments) {
      ChartOfAccountsCollection.update(
        { _id: id },
        {
          $push: {
            segments: {
              _id: new Mongo.ObjectID()._str,
              description: segment.description,
              subSegments: segment.subSegments,
              chartFieldOrder: segment.chartFieldOrder,
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
  "chartOfAccounts.metrics.insert": function (id, metrics) {
    check(id, String);
    check(metrics, [
      {
        columns: [String],
        id: Number,
        name: String,
        metricSegments: [String], // metricSegments - Array of column names that are linked to Segments
        validMethods: [String], // validMethods - Array of column names that are used for allocation
        rows: [[{ rowNumber: Number, value: Match.OneOf(String, Number) }]],
      },
    ]);

    // If a user not logged in or the user is not an admin
    if (!this.userId && !Meteor.user()?.admin) {
      throw new Meteor.Error("Not authorized.");
    }

    for (const metric of metrics) {
      const description = metric.name;
      const columnNames = metric.columns;
      const validMethods = metric.validMethods;
      const metricSegments = metric.metricSegments;
      const columns = columnNames.map((cn, index) => ({
        title: cn,
        rows: metric.rows.map((row) => {
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
    }
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
  "chartOfAccounts.templates.insert": function (id, template) {
    check(id, String);
    check(template, {
      name: String,
      description: String,
      balancingAccount: [
        {
          description: String,
          segmentId: Match.OneOf(String, Number),
          category: Match.Optional(String),
          typicalBalance: Match.Optional(String),
        },
      ],
      glCodeToAllocate: {
        allocationSegment: {
          description: String,
          segmentId: Match.OneOf(String, Number),
          typicalBalance: Match.Optional(String),
          category: Match.Optional(String),
        },
        typicalBalance: String,
      },
      otherSegments: Match.Maybe([
        {
          description: String,
          segmentId: Match.OneOf(String, Number),
        },
      ]),
      subGLCode: {
        selectedSubGLSegment: {
          description: String,
          segmentId: Match.OneOf(String, Number),
        },
        subGLSegment: {
          allocations: {
            description: String,
            segmentId: Match.OneOf(String, Number),
          },
          balance: {
            description: String,
            segmentId: Match.OneOf(String, Number),
          },
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
            ...template,
          },
        },
      }
    );
    return { templateId, numberOfDocumentsUpdate };
  },
  "chartOfAccounts.templates.update": function (id, templateId, template) {
    check(id, String);
    check(templateId, String);
    check(template, {
      name: String,
      description: String,
      balancingAccount: [
        {
          description: String,
          segmentId: Match.OneOf(String, Number),
          category: Match.Optional(String),
          typicalBalance: Match.Optional(String),
        },
      ],
      glCodeToAllocate: {
        allocationSegment: {
          description: String,
          segmentId: Match.OneOf(String, Number),
          typicalBalance: Match.Optional(String),
          category: Match.Optional(String),
        },
        typicalBalance: String,
      },
      otherSegments: Match.Maybe([String]),
      subGLCode: {
        selectedSubGLSegment: {
          description: String,
          segmentId: Match.OneOf(String, Number),
        },
        subGLSegment: {
          allocations: {
            description: String,
            segmentId: Match.OneOf(String, Number),
          },
          balance: {
            description: String,
            segmentId: Match.OneOf(String, Number),
          },
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

    const numberOfDocumentsUpdate = ChartOfAccountsCollection.update(
      { _id: id },
      {
        $set: {
          "templates.$[t]": {
            _id: templateId,
            ...template,
          },
        },
      },
      {
        arrayFilters: [{ "t._id": templateId }],
      }
    );
    return { templateId, numberOfDocumentsUpdate };
  },
});
