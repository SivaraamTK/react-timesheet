// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const timesheetController = require("./controllers/timesheetController");
const { connectToDatabase, closeDatabase } = require("./database/dbConfig");
const errorHandler = require("./utilities/errorHandlers");

// Connect to PostgreSQL database
connectToDatabase();

// Create an Express app
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

//Load the timesheet controller routes
app.use("/", timesheetController);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing PostgreSQL connection...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Closing PostgreSQL connection...");
  await closeDatabase();
  process.exit(0);
});
