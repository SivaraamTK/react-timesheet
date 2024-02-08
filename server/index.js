const express = require("express");
const fs = require("fs");
const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let timesheets = {};

// Load timesheets from data.json
if (fs.existsSync("data.json")) {
  const rawData = fs.readFileSync("data.json");
  timesheets = JSON.parse(rawData);
  console.log("Timesheets loaded from data.json");
}
// Create data.json if it doesn't exist
else {
  fs.writeFileSync("data.json", JSON.stringify({}));
  console.log("data.json file created");
}

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

// Get the previous Monday's date for the given date, or the date of Monday of the current week if no date is provided
const getPreviousMonday = (date = null) => {
  const prevMonday = (date && new Date(date.valueOf())) || new Date();
  prevMonday.setDate(prevMonday.getDate() - ((prevMonday.getDay() + 6) % 7));
  return prevMonday;
};

// Get the monday date of the current week
const currentStartDate = getPreviousMonday().toISOString().split("T")[0];

// Get all timesheets
app.get("/timesheets", (req, res) => {
  if (fs.existsSync("data.json")) {
    const rawData = fs.readFileSync("data.json");
    timesheets = JSON.parse(rawData);
    console.log("Timesheets loaded from data.json");
  }
  if (Object.keys(timesheets).length === 0) {
    console.log(
      `No timesheets found. Creating a new timesheet for the current week with ${currentStartDate} as Monday.`
    );
    timesheets[currentStartDate] = defaultTimesheet;
    fs.writeFileSync("data.json", JSON.stringify(timesheets));
  }
  res.json(timesheets);
  console.log("Timesheets sent");
});

// Get a specific timesheet by starting date of the week
app.get("/timesheets/:startDate", (req, res) => {
  let timesheet = timesheets[req.params.startDate];
  if (!timesheet) {
    console.log(
      `No timesheet found for week starting with ${req.params.startDate} as Monday. Creating a new timesheet for the current week.`
    );
    timesheet = defaultTimesheet;
    timesheets[req.params.startDate] = timesheet;
    fs.writeFileSync("data.json", JSON.stringify(timesheets));
  }
  res.send(timesheet);
  console.log(
    `Timesheet for week starting with ${req.params.startDate} as Monday sent`
  );
});

// Create a new timesheet
app.post("/timesheets/:startDate", (req, res) => {
  const timesheet = timesheets[req.params.startDate];
  if (timesheet) {
    console.log(
      `Timesheet for week starting with ${req.params.startDate} as Monday already exists. Redirecting to update the timesheet.`
    );
    return res.redirect(`/timesheets/${req.params.startDate}`);
  }

  const newTimesheet = {
    projectType: req.body.projectType,
    projectName: req.body.projectName,
    task: req.body.task,
    comment: req.body.comment,
    hours: req.body.hours,
    total: req.body.total,
  };
  timesheets[req.params.startDate] = newTimesheet;
  fs.writeFileSync("data.json", JSON.stringify(timesheets));
  res.send(newTimesheet);
  console.log(
    `New timesheet for the week starting with ${req.params.startDate} as Monday created`
  );
});

// Update a timesheet
app.put("/timesheets/:startDate", (req, res) => {
  let timesheet = timesheets[req.params.startDate];
  if (!timesheet) {
    console.log(
      `Timesheet for the week starting with ${req.params.startDate} as Monday not found. Creating a new timesheet.`
    );
    timesheet = {
      projectType: req.body.projectType,
      projectName: req.body.projectName,
      task: req.body.task,
      comment: req.body.comment,
      hours: req.body.hours,
      total: req.body.total,
    };
    timesheets[req.params.startDate] = timesheet;
    fs.writeFileSync("data.json", JSON.stringify(timesheets));
    res.send(timesheet);
    console.log(
      `New timesheet for the week starting with ${req.params.startDate} as Monday created`
    );
    return;
  }

  timesheet.projectType = req.body.projectType;
  timesheet.projectName = req.body.projectName;
  timesheet.task = req.body.task;
  timesheet.comment = req.body.comment;
  timesheet.hours = req.body.hours;
  timesheet.total = req.body.total;

  fs.writeFileSync("data.json", JSON.stringify(timesheets));
  res.send(timesheet);
  console.log(
    `Timesheet for the week starting with ${req.params.startDate} as Monday updated`
  );
});

// Delete a timesheet
app.delete("/timesheets/:startDate", (req, res) => {
  const timesheet = timesheets[req.params.startDate];
  if (!timesheet) {
    console.log(
      `The timesheet for the week starting with ${req.params.startDate} as Monday was not found.`
    );
    return res
      .status(404)
      .send(
        `The timesheet for the week starting with ${req.params.startDate} as Monday was not found.`
      );
  }

  delete timesheets[req.params.startDate];
  fs.writeFileSync("data.json", JSON.stringify(timesheets));
  res.send(
    `Deleted the timesheet for the week starting with ${req.params.startDate} as Monday successfully`
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
