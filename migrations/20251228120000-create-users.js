'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table matching the fields in models/user.js
    await queryInterface.createTable('Users', {
      userID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      positionID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Positions',
          key: 'positionID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.dropTable('Users');
  }
};
