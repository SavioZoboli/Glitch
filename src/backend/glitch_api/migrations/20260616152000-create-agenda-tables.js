"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("agenda_eventos", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      origem_tipo: {
        type: Sequelize.ENUM("TORNEIO", "PARTIDA", "CUSTOM"),
        allowNull: false,
      },
      origem_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      titulo_snapshot: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      descricao_snapshot: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      inicio_snapshot: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fim_snapshot: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("ATIVO", "CONCLUIDO", "CANCELADO"),
        allowNull: false,
        defaultValue: "ATIVO",
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      is_ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      dt_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      dt_atualizacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("agenda_usuarios", {
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
        onDelete: "RESTRICT",
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
      papel: {
        type: Sequelize.ENUM("ORGANIZADOR", "INSCRITO", "ESPECTADOR"),
        allowNull: false,
      },
      fonte: {
        type: Sequelize.ENUM("AUTO", "MANUAL"),
        allowNull: false,
        defaultValue: "AUTO",
      },
      is_ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      dt_adicionado: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      dt_removido: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("agenda_eventos", ["origem_tipo", "origem_id"], {
      name: "idx_agenda_eventos_origem",
    });
    await queryInterface.addIndex("agenda_eventos", ["inicio_snapshot"], {
      name: "idx_agenda_eventos_inicio_snapshot",
    });
    await queryInterface.addIndex("agenda_eventos", ["status"], {
      name: "idx_agenda_eventos_status",
    });

    await queryInterface.addIndex("agenda_usuarios", ["usuario_id", "is_ativo"], {
      name: "idx_agenda_usuarios_usuario_ativo",
    });
    await queryInterface.addIndex("agenda_usuarios", ["evento_id"], {
      name: "idx_agenda_usuarios_evento",
    });

    await queryInterface.addConstraint("agenda_usuarios", {
      fields: ["usuario_id", "evento_id", "papel"],
      type: "unique",
      name: "uq_agenda_usuarios_usuario_evento_papel",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("agenda_usuarios");
    await queryInterface.dropTable("agenda_eventos");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_agenda_usuarios_papel";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_agenda_usuarios_fonte";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_agenda_eventos_origem_tipo";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_agenda_eventos_status";',
    );
  },
};

