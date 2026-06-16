"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const colunas = await queryInterface.describeTable("torneios");

    const addSeNaoExistir = async (nomeColuna, definicao) => {
      if (!colunas[nomeColuna]) {
        await queryInterface.addColumn("torneios", nomeColuna, definicao);
      }
    };

    await addSeNaoExistir("tipo_realizacao", {
      type: Sequelize.ENUM("Online", "Presencial"),
      allowNull: true,
    });

    await addSeNaoExistir("endereco_rua", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });

    await addSeNaoExistir("endereco_numero", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await addSeNaoExistir("endereco_bairro", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });

    await addSeNaoExistir("endereco_cidade", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });

    await addSeNaoExistir("endereco_estado", {
      type: Sequelize.STRING(2),
      allowNull: true,
    });

    await addSeNaoExistir("endereco_cep", {
      type: Sequelize.STRING(9),
      allowNull: true,
    });

    await addSeNaoExistir("qtd_participantes_min", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await addSeNaoExistir("qtd_participantes_max", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await addSeNaoExistir("dt_limite_ingresso", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addSeNaoExistir("aceita_ingresso", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await addSeNaoExistir("tipo_inscricao", {
      type: Sequelize.ENUM("Individual", "Grupo"),
      allowNull: true,
    });

    await addSeNaoExistir("qtd_grupos", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await addSeNaoExistir("valor_ingresso", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await addSeNaoExistir("valor_premiacao", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await addSeNaoExistir("plataforma_coleta", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });

    await addSeNaoExistir("plataforma_streaming", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });

    // Backfill dos campos que já existem em configs_inscricao.
    await queryInterface.sequelize.query(`
      UPDATE torneios t
      SET
        qtd_participantes_max = ci.qtd_participantes_max,
        dt_limite_ingresso = ci.dt_fim::date,
        tipo_inscricao = CASE
          WHEN UPPER(ci.modo_inscricao) = 'GRUPO'
            THEN 'Grupo'::"enum_torneios_tipo_inscricao"
          WHEN UPPER(ci.modo_inscricao) = 'INDIVIDUAL'
            THEN 'Individual'::"enum_torneios_tipo_inscricao"
          ELSE NULL
        END
      FROM configs_inscricao ci
      WHERE ci.torneio_id = t.id;
    `);
  },

  async down(queryInterface, Sequelize) {
    const colunas = await queryInterface.describeTable("torneios");

    const removeSeExistir = async (nomeColuna) => {
      if (colunas[nomeColuna]) {
        await queryInterface.removeColumn("torneios", nomeColuna);
      }
    };

    await removeSeExistir("plataforma_streaming");
    await removeSeExistir("plataforma_coleta");
    await removeSeExistir("valor_premiacao");
    await removeSeExistir("valor_ingresso");
    await removeSeExistir("qtd_grupos");
    await removeSeExistir("tipo_inscricao");
    await removeSeExistir("aceita_ingresso");
    await removeSeExistir("dt_limite_ingresso");
    await removeSeExistir("qtd_participantes_max");
    await removeSeExistir("qtd_participantes_min");
    await removeSeExistir("endereco_cep");
    await removeSeExistir("endereco_estado");
    await removeSeExistir("endereco_cidade");
    await removeSeExistir("endereco_bairro");
    await removeSeExistir("endereco_numero");
    await removeSeExistir("endereco_rua");
    await removeSeExistir("tipo_realizacao");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_torneios_tipo_realizacao";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_torneios_tipo_inscricao";',
    );
  },
};
