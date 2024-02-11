// controllers/timesheetController.js
const express = require("express");
const router = express.Router();
const {
  loadTimesheets,
  updateTimesheet,
} = require("../services/timesheetService");
const { asyncHandler } = require("../utilities/asyncHandlers");
const { Timesheet, defaultTimesheet } = require("../models/timesheetModel");

// Get all timesheets
router.get(
  "/timesheets",
  asyncHandler(async (req, res) => {
    const timesheets = await loadTimesheets();
    console.log("Timesheets sent");
    return res.status(200).json(timesheets);
  })
);

// Get a specific timesheet by starting date of the week
router.get(
  "/timesheets/:startDate",
  asyncHandler(async (req, res) => {
    let timesheet = await Timesheet.findByPk(req.params.startDate, {
      attributes: ["startDate", "timesheetData"],
    });
    if (!timesheet) {
      await updateTimesheet(req.params.startDate, defaultTimesheet);
      timesheet = defaultTimesheet;
    }
    console.log(
      `Timesheet for week starting with ${req.params.startDate} as Monday sent`
    );
    return res.status(200).json(timesheet);
  })
);

// Create/Update a timesheet
router.post(
  "/timesheets/:startDate",
  asyncHandler(async (req, res) => {
    await updateTimesheet(req.params.startDate, req.body);
    console.log(
      `New timesheet for the week starting with ${req.params.startDate} as Monday created`
    );
    return res.status(201).send(req.body);
  })
);

// Delete a timesheet
router.delete(
  "/timesheets/:startDate",
  asyncHandler(async (req, res) => {
    const timesheet = await Timesheet.findByPk(req.params.startDate);
    if (!timesheet) {
      return res
        .status(404)
        .send(
          `The timesheet for the week starting with ${req.params.startDate} as Monday was not found.`
        );
    }
    await timesheet.destroy();
    return res
      .status(200)
      .send(
        `Deleted the timesheet for the week starting with ${req.params.startDate} as Monday successfully`
      );
  })
);

module.exports = router;
