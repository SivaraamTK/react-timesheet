// models/timesheetModel.js
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../database/dbConfig");

// Define the Timesheet model
class Timesheet extends Model {}

// Initialize the Timesheet model
Timesheet.init(
  {
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true,
    },
    timesheetData: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Timesheet",
    indexes: [{ fields: ["startDate"] }],
  }
);

// Default timesheet values
const defaultTimesheet = [
  {
    projectType: "",
    projectName: "",
    task: "",
    comment: "",
    hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    total: 0,
  },
];

module.exports = { Timesheet, defaultTimesheet };
