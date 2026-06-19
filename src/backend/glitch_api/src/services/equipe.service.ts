import { sequelize } from "../config/database.config";
import models from "../models/index.models";
import { Op } from "sequelize";

class UsuarioService {
  public async addEquipe(nome: string, lider: string): Promise<any> {
    let transaction = await sequelize.transaction();
    try {
      let equipe = await models.Equipes.create(
        {
          nome: nome,
          dt_criacao: new Date(),
        },
        { transaction },
      );
      let membro = await models.MembrosEquipe.create(
        {
          equipe_id: equipe.dataValues.id,
          usuario_id: lider,
          is_ativo: true,
          is_lider: true,
          is_titular: true,
          dt_convite: new Date(),
          dt_aceito: new Date(),
        },
        { transaction },
      );
      transaction.commit();
      return equipe;
    } catch (e) {
      transaction.rollback();
      throw e;
    }
  }

  public async convidarJogador(
    equipe_id: string,
    convidado: {
      nickname: string;
      is_titular: boolean;
      is_lider: boolean;
      funcao: string;
    },
    tipo: "convite" | "solicitacao" = "convite",
  ): Promise<any> {
    let transaction = await sequelize.transaction();
    try {
      let equipe = await models.Equipes.findByPk(equipe_id, { transaction });
      if (!equipe) {
        await transaction.rollback();
        throw new Error("Equipe não encontrada");
      }

      let jogador = await models.Usuarios.findOne({
        where: { nickname: convidado.nickname },
        transaction,
      });

      if (!jogador) {
        await transaction.rollback();
        throw new Error("Jogador não encontrado");
      }

      const membroExistente = await models.MembrosEquipe.findOne({
        where: {
          equipe_id,
          usuario_id: jogador.dataValues.id,
        },
        transaction,
      });

      const isAtivo = false;
      if (membroExistente) {
        await membroExistente.update(
          {
            is_ativo: isAtivo,
            is_lider: convidado.is_lider,
            is_titular: convidado.is_titular,
            funcao: convidado.funcao,
            dt_convite: new Date(),
            dt_aceito: null,
            dt_saida: null,
            tipo,
          },
          { transaction },
        );
      } else {
        await models.MembrosEquipe.create(
          {
            equipe_id: equipe.dataValues.id,
            usuario_id: jogador.dataValues.id,
            is_ativo: isAtivo,
            is_lider: convidado.is_lider,
            is_titular: convidado.is_titular,
            dt_convite: new Date(),
            dt_aceito: null,
            dt_saida: null,
            funcao: convidado.funcao,
            tipo,
          },
          { transaction },
        );
      }
      await transaction.commit();
      return true;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  public async getMinhasEquipes(usuario_id: string): Promise<any> {
    try {
      let equipes = await models.Equipes.findAll({
        attributes: ["id", "nome", "dt_criacao"],
        include: [
          {
            model: models.MembrosEquipe,
            as: "associacoesMembro",
            attributes: [
              "funcao",
              "is_lider",
              "is_titular",
              "dt_aceito",
              "tipo",
            ],
            where: {
              is_ativo: true,
              dt_aceito: { [Op.not]: null },
              dt_saida: null,
              usuario_id,
              is_titular: true,
            },
            include: [
              {
                model: models.Usuarios,
                as: "membro",
              },
            ],
          },
        ],
        where: { is_ativo: true },
      });
      return equipes;
    } catch (e) {
      throw e;
    }
  }

  public async getEquipes(): Promise<any> {
    try {
      let resposta = await models.Equipes.findAll({
        attributes: ["id", "nome"],
        where: { is_ativo: true },
        include: [
          {
            model: models.Usuarios,
            as: "membros", 
            attributes: ["nickname"],
            through: {
              attributes: ["funcao", "is_lider", "is_titular", "is_ativo"],
              where: {
                is_ativo: true,
                dt_saida: {
                  [Op.is]: null,
                },
              },
            },
          },
        ],
      });
      return resposta;
    } catch (e) {
      throw e;
    }
  }

  public async getEquipePorId(id: string): Promise<any> {
    try {
      let resposta = await models.Equipes.findByPk(id, {
        attributes: ["id", "nome"],
        include: [
          {
            model: models.Usuarios,
            as: "membros", 
            attributes: ["nickname"],
            through: {
            
              attributes: [
                "funcao",
                "is_lider",
                "is_titular",
                "is_ativo",
                "dt_aceito",
              ],
              where: {
                is_ativo: true,
                dt_saida: {
                  [Op.is]: null,
                },
              },
            },
          },
        ],
      });

      if (!resposta) {
        throw new Error("Equipe não encontrada");
      }

      let equipe: any = resposta.toJSON();
      equipe.membros = equipe.membros.map((membro: any) => {
        return {
          nickname: membro.nickname,
          ...membro.MembrosEquipe,
        };
      });

      return equipe;
    } catch (e) {
      throw e;
    }
  }

  public async getInvites(usuario_id: string): Promise<any> {
    try {
      let invites = await models.Equipes.findAll({
        attributes: ["id", "nome"],
        where: { is_ativo: true },
        include: [
          // Garante que EU sou líder da equipe
          {
            model: models.MembrosEquipe,
            as: "membrosAtivos",
            attributes: ["usuario_id", "is_lider"],
            required: false,
            where: {
              usuario_id,
              is_lider: true,
              dt_saida: null,
              dt_aceito: { [Op.not]: null },
            },
          },

          //Busca os convites pendentes da equipe
          {
            model: models.MembrosEquipe,
            as: "associacoesMembro",
            attributes: [
              "funcao",
              "is_lider",
              "is_titular",
              "dt_aceito",
              "tipo",
              "usuario_id",
            ],
            where: {
              dt_aceito: { [Op.is]: null },
              dt_saida: { [Op.is]: null },
            },
            include: [
              {
                model: models.Usuarios,
                as: "membro",
                attributes: ["id", "nickname", "avatar_url"],
              },
            ],
          },
        ],
      });

      //Filtro de situações:
      invites = invites
        .map((equipe: any) => {
          const souLider = (equipe.membrosAtivos?.length ?? 0) > 0;

          equipe.associacoesMembro = equipe.associacoesMembro.filter(
            (m: any) => {
              //Convites para mim
              if (m.tipo === "convite" && m.usuario_id === usuario_id) {
                return true;
              }

              //Solicitações para entrar na minha equipe
              if (m.tipo === "solicitacao" && souLider) {
                return true;
              }
              return false;
            },
          );
          return equipe;
        })
        .filter((equipe: any) => equipe.associacoesMembro.length > 0);
      return invites;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async answerInvite(
    usuarioLogado: string,
    equipe: string,
    usuarioAlvo: string,
    resposta: boolean,
  ) {
    let transaction = await sequelize.transaction();
    try {
      let convite = await models.MembrosEquipe.findOne({
        where: {
          equipe_id: equipe,
          usuario_id: usuarioAlvo,
          dt_aceito: null,
          dt_saida: null,
        },
        transaction,
      });
      if (!convite) {
        throw new Error("Convite não encontrado ou já respondido");
      }
      if (resposta) {
        //Aceito
        await convite.update(
          {
            dt_aceito: new Date(),
            is_ativo: true,
          },
          { transaction },
        );
      } else {
        //Recusado
        await convite.update(
          {
            dt_saida: new Date(),
          },
          { transaction },
        );
      }
      await transaction.commit();
      return 200;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async updateEquipe(id: string, novo_nome: string): Promise<any> {
    let transaction = await sequelize.transaction();
    try {
      let possivel_equipe = await models.Equipes.findOne({
        where: { nome: novo_nome },
      });
      if (possivel_equipe) {
        throw new Error("Já existe uma equipe com esse nome");
      }
      let equipe = await models.Equipes.findByPk(id);
      if (!equipe) {
        throw new Error("Equipe não encontrada");
      }
      await equipe.update({ nome: novo_nome }, { transaction });
      await transaction.commit();
      return "200";
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async updateMembro(
    membro: {
      nickname: string;
      is_titular: boolean;
      is_lider: boolean;
      funcao: string;
    },
    equipe: string,
  ): Promise<any> {
    let transaction = await sequelize.transaction();
    try {
      let usuario = await models.Usuarios.findOne({
        where: { nickname: membro.nickname },
        transaction,
      });
      if (!usuario) {
        throw new Error("Usuario nao encontrado");
      }

      let membroEquipe = await models.MembrosEquipe.findOne({
        where: {
          usuario_id: usuario.dataValues.id,
          equipe_id: equipe,
          is_ativo: true,
          dt_saida: { [Op.is]: null },
        },
        transaction,
      });
      if (!membroEquipe) {
        throw new Error("Membro da equipe nao encontrado");
      }

      // Promove o membro para lider e rebaixa os demais membros ativos.
      if (membro.is_lider) {
        if (!membroEquipe.dataValues.dt_aceito) {
          throw new Error("Somente membros ativos podem ser lideres");
        }

        await models.MembrosEquipe.update(
          { is_lider: false },
          {
            where: {
              equipe_id: equipe,
              usuario_id: { [Op.ne]: usuario.dataValues.id },
              is_ativo: true,
              dt_aceito: { [Op.not]: null },
              dt_saida: { [Op.is]: null },
            },
            transaction,
          },
        );
      }

      await membroEquipe.update(
        {
          is_titular: membro.is_titular,
          is_lider: membro.is_lider,
          funcao: membro.funcao,
        },
        { transaction },
      );
      await transaction.commit();
      return "200";
    } catch (e) {
      await transaction.rollback();
      console.error(e);
      throw e;
    }
  }

  async removeEquipe(id: string): Promise<any> {
    const transaction = await sequelize.transaction();
    try {
      const equipe = await models.Equipes.findByPk(id, {
        transaction,
        attributes: ["id"],
      });

      if (!equipe) {
        await transaction.rollback();
        throw new Error("Equipe não encontrada");
      }
      await Promise.all([
        models.MembrosEquipe.update(
          { is_ativo: false },
          { where: { equipe_id: id }, transaction },
        ),
        // Atualiza a equipe
        models.Equipes.update(
          { is_ativo: false },
          { where: { id: id }, transaction },
        ),
      ]);

      await transaction.commit();
      return {
        success: true,
        message: "Equipe e membros removidos com sucesso",
      };
    } catch (e) {
      await transaction.rollback();
      console.error("Erro ao remover equipe:", e);
      throw e;
    }
  }

  async removeMembro(nickname: string, equipe: string): Promise<any> {
    let transaction = await sequelize.transaction();
    try {
      let usuario = await models.Usuarios.findOne({ where: { nickname } });
      let membroEquipe = await models.MembrosEquipe.findOne({
        where: { equipe_id: equipe, usuario_id: usuario?.dataValues.id },
        transaction,
      });
      if (!membroEquipe) {
        await transaction.rollback();
        throw new Error("Membro da equipe não encontrada");
      }
      await membroEquipe.update({ is_ativo: false });
      await transaction.commit();
      return "200";
    } catch (e) {
      await transaction.rollback();
      console.error("Erro ao remover equipe:", e);
      throw e;
    }
  }

  public async verificarSeLider(
    usuario_id: string,
    equipe_id: string,
  ): Promise<boolean> {
    const membro = await models.MembrosEquipe.findOne({
      where: {
        usuario_id,
        equipe_id,
        is_lider: true,
        is_ativo: true,
        dt_aceito: { [Op.not]: null },
        dt_saida: { [Op.is]: null },
      },
    });
    return !!membro;
  }
}

export default new UsuarioService();
