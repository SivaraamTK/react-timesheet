module.exports = {
  //Create a new table called "Timesheets"
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Timesheets", {
      startDate: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DATE,
      },
      timesheetData: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  //Drop the "Timesheets" table
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Timesheets");
  },
};
