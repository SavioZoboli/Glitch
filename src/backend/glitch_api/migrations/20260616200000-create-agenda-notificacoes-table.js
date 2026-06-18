"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("agenda_notificacoes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      evento_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "agenda_eventos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tipo_alerta: {
        type: Sequelize.ENUM("DIA_09H", "ANTES_5MIN"),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      mensagem: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      referencia_data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      dt_evento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_lida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      dt_lida: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dt_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "agenda_notificacoes",
      ["usuario_id", "is_lida", "dt_criacao"],
      {
        name: "idx_agenda_notificacoes_usuario_lida_criacao",
      },
    );

    await queryInterface.addIndex(
      "agenda_notificacoes",
      ["evento_id", "dt_evento"],
      {
        name: "idx_agenda_notificacoes_evento_data",
      },
    );

    await queryInterface.addConstraint("agenda_notificacoes", {
      fields: ["usuario_id", "evento_id", "tipo_alerta", "referencia_data"],
      type: "unique",
      name: "uq_agenda_notificacoes_deduplicacao_alerta",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("agenda_notificacoes");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_agenda_notificacoes_tipo_alerta";',
    );
  },
};
