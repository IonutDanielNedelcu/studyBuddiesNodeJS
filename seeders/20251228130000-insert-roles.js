/**
 * Seeder to insert default roles: Admin, Manager, Employee
 */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Roles', [
      { name: 'Admin' },
      { name: 'Manager' },
      { name: 'Employee' },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Roles', {
      name: { [Sequelize.Op.in]: ['Admin', 'Manager', 'Employee'] }
    }, {});
  }
};
