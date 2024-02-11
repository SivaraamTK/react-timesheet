const { Sequelize } = require("sequelize");

const errorHandler = async (err, req, res, next) => {
  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
};

module.exports = errorHandler;
