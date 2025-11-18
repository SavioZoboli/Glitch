'use strict';

const {randomUUID} = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('jogos',[{
      id:randomUUID(),
      nome:'Counter Strike 2',
      class_indicativa:'LIV',
      estudio:'Valve'
    },{
      id:randomUUID(),
      nome:'League of Legends',
      class_indicativa:'LIV',
      estudio:'Riot'
    }])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('jogos',null,[])
  }
};
