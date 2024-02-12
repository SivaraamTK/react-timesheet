require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");
const logFile = path.join(logDir, "database.log");

// Check if the logs directory exists, if not create it
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
// Check if the database.log file exists, if not create it
if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "");
}

const logStream = fs.createWriteStream(logFile, { flags: "a" });

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

// Test connection to PostgreSQL database and sync models
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// Close the connection to the PostgreSQL database
const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log("Connection has been closed successfully.");
  } catch (error) {
    console.error("Unable to close the database:", error);
  }
};

module.exports = { sequelize, connectToDatabase, closeDatabase };
