"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const colunas = await queryInterface.describeTable("usuarios");

    if (!colunas.sobre_mim) {
      await queryInterface.addColumn("usuarios", "sobre_mim", {
        type: Sequelize.STRING(500),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const colunas = await queryInterface.describeTable("usuarios");

    if (colunas.sobre_mim) {
      await queryInterface.removeColumn("usuarios", "sobre_mim");
    }
  },
};

