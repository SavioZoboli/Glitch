'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('equipes','is_ativo',{
      type:Sequelize.BOOLEAN,
      allowNull:true,
      defaultValue:true
    })

    await queryInterface.bulkUpdate('equipes',{is_ativo:true});

    await queryInterface.changeColumn('equipes','is_ativo',{
      type:Sequelize.BOOLEAN,
      allowNull:false,
      defaultValue:true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('equipes','is_ativo')
  }
};
