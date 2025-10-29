"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("membros_equipe", "funcao", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("membros_equipe", "funcao", {
      type: Sequelize.STRING(20),
      allowNull: false,
    });
  },
};
