const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const port = 8080;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var timesheets = {};

const dataFilePath = path.join(__dirname, "data.json");

// Function to update a timesheet
async function updateTimesheet(startDate, timesheetData) {
  timesheets[startDate] = timesheetData;
  await fs.writeFile(dataFilePath, JSON.stringify(timesheets));
}

// Get the previous Monday's date for the given date, or the date of Monday of the current week if no date is provided
const getPreviousMonday = (date = null) => {
  const prevMonday = (date && new Date(date.valueOf())) || new Date();
  prevMonday.setDate(prevMonday.getDate() - ((prevMonday.getDay() + 6) % 7));
  return prevMonday;
};

// Get the monday date of the current week
const currentStartDate = getPreviousMonday().toISOString().split("T")[0];

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

// Load timesheets from data.json
const loadTimesheets = async () => {
  try {
    const rawData = await fs.readFile(dataFilePath);
    timesheets = JSON.parse(rawData);
    if (Object.keys(timesheets).length === 0) {
      console.log("No timesheets found in data.json");
      await fs.writeFile(
        dataFilePath,
        JSON.stringify({ currentStartDate: defaultTimesheet })
      );
    }
    console.log(`Timesheets loaded from ${dataFilePath} successfully.`);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(
        dataFilePath,
        JSON.stringify({ currentStartDate: defaultTimesheet })
      );
      console.log("data.json file created");
    } else {
      throw err;
    }
  }
};

// Load timesheets from data.json
loadTimesheets();

// Get all timesheets
app.get("/timesheets", async (req, res) => {
  await loadTimesheets();
  if (Object.keys(timesheets).length === 0) {
    console.log(
      `No timesheets found. Creating a new timesheet for the current week with ${currentStartDate} as Monday.`
    );
    timesheets[currentStartDate] = defaultTimesheet;
    await fs.writeFile(dataFilePath, JSON.stringify(timesheets));
  }
  console.log("Timesheets sent");
  return res.status(200).json(req.body);
});

// Get a specific timesheet by starting date of the week
app.get("/timesheets/:startDate", async (req, res) => {
  await loadTimesheets();
  let timesheet = timesheets[req.params.startDate];
  if (!timesheet) {
    console.log(
      `No timesheet found for week starting with ${req.params.startDate} as Monday. Creating a new timesheet for the current week.`
    );
    timesheet = defaultTimesheet;
    timesheets[req.params.startDate] = timesheet;
    await fs.writeFile(dataFilePath, JSON.stringify(timesheets));
  }
  console.log(
    `Timesheet for week starting with ${req.params.startDate} as Monday sent`
  );
  return res.status(200).send(req.body);
});

// Create a new timesheet
app.post("/timesheets/:startDate", async (req, res) => {
  await loadTimesheets();
  const oldTimesheet = timesheets[req.params.startDate];
  if (oldTimesheet) {
    console.log(
      `Timesheet for week starting with ${req.params.startDate} as Monday already exists. Redirecting to update the timesheet.`
    );
    await updateTimesheet(req.params.startDate, req.body);
    return res.status(200).send(req.body);
  }
  const newTimesheet = req.body;
  timesheets[req.params.startDate] = newTimesheet;
  await fs.writeFile(dataFilePath, JSON.stringify(timesheets));
  console.log(
    `New timesheet for the week starting with ${req.params.startDate} as Monday created`
  );
  return res.status(200).send(req.body);
});

// Delete a timesheet
app.delete("/timesheets/:startDate", async (req, res) => {
  await loadTimesheets();
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
  await fs.writeFile(dataFilePath, JSON.stringify(timesheets));
  return res
    .status(200)
    .send(
      `Deleted the timesheet for the week starting with ${req.params.startDate} as Monday successfully`
    );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
