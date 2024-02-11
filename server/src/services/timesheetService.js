// services/timesheetService.js
const { Timesheet } = require("../models/timesheetModel");

// Load timesheets from database
const loadTimesheets = async () => {
  console.log("Loading all the timesheets from the database...");
  return Timesheet.findAll();
};

// Function to update a timesheet using upsert
const updateTimesheet = async (startDate, timesheetData) => {
  console.log(
    `Updating the timesheet for the week starting with ${startDate} as Monday...`
  );
  return Timesheet.upsert(
    {
      startDate,
      timesheetData,
    },
    { returning: true }
  );
};

module.exports = {
  loadTimesheets,
  updateTimesheet,
};
