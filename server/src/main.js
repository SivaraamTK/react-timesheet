require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes, Model } = require("sequelize");
const compression = require("compression");
const fs = require("fs");
const path = require("path");

const logStream = fs.createWriteStream(
  path.join(__dirname, "../logs/database.log"),
  { flags: "a" }
);

// Connector to PostgreSQL database
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: (...msg) => logStream.write(msg.join(" ") + "\n"),
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10),
    min: parseInt(process.env.DB_POOL_MIN, 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10),
    idle: parseInt(process.env.DB_POOL_IDLE, 10),
  },
});

// Define the Timesheet model
class Timesheet extends Model {}

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

// Wrap async route handlers with a function that catches errors
function asyncHandler(handler) {
  return function (req, res, next) {
    return handler(req, res, next).catch(next);
  };
}

// Test connection to PostgreSQL database and sync models
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// Load timesheets from database
const loadTimesheets = async () => {
  console.log("Loading all the timesheets from the database...");
  return Timesheet.findAll();
};

// Function to update a timesheet
const updateTimesheet = async (startDate, timesheetData) => {
  const transaction = await sequelize.transaction();
  try {
    await Timesheet.upsert({ startDate, timesheetData }, { transaction });
    console.log(
      `Timesheet for week starting with ${startDate} as Monday updated`
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

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

// Connect to PostgreSQL database
connectToDatabase();

// Create an Express app
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

// Error handling middleware
app.use(async (err, req, res, next) => {
  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Get all timesheets
app.get(
  "/timesheets",
  asyncHandler(async (req, res) => {
    const timesheets = await loadTimesheets();
    console.log("Timesheets sent");
    return res.status(200).json(timesheets);
  })
);

// Get a specific timesheet by starting date of the week
app.get(
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
app.post(
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
app.delete(
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Gracefully close the PostgreSQL connection when the process is terminated
process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing PostgreSQL connection...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Closing PostgreSQL connection...");
  await sequelize.close();
  process.exit(0);
});
