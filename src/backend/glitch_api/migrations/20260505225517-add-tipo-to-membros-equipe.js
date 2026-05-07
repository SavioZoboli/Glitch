"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("membros_equipe", "tipo", {
      type: Sequelize.ENUM("convite", "solicitacao"),
      allowNull: false,
      defaultValue: "convite", // registros existentes serão tratados como convite
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("membros_equipe", "tipo");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_membros_equipe_tipo";',
    );
  },
};
