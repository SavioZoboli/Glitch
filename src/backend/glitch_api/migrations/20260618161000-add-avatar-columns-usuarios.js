"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const colunas = await queryInterface.describeTable("usuarios");

    const addSeNaoExistir = async (nomeColuna, definicao) => {
      if (!colunas[nomeColuna]) {
        await queryInterface.addColumn("usuarios", nomeColuna, definicao);
      }
    };

    await addSeNaoExistir("avatar_url", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await addSeNaoExistir("avatar_mime", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await addSeNaoExistir("avatar_tamanho_bytes", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await addSeNaoExistir("avatar_atualizado_em", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const colunas = await queryInterface.describeTable("usuarios");

    const removeSeExistir = async (nomeColuna) => {
      if (colunas[nomeColuna]) {
        await queryInterface.removeColumn("usuarios", nomeColuna);
      }
    };

    await removeSeExistir("avatar_atualizado_em");
    await removeSeExistir("avatar_tamanho_bytes");
    await removeSeExistir("avatar_mime");
    await removeSeExistir("avatar_url");
  },
};

