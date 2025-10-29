'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('equipes','data_criacao');
    await queryInterface.addColumn('equipes','dt_criacao',{
      type:Sequelize.DATE,
      allowNull:false,
      defaultValue:new Date()
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('equipes','dt_criacao');
    await queryInterface.addColumn('equipes','data_criacao',{
      type:Sequelize.DATE,
      allowNull:false
    })
  }
};
