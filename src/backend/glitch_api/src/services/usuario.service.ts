import { sequelize } from "../config/database.config";
import Usuario, { Usuarios } from "../models/pessoas/usuarios.model";
import criptoService from "./cripto.service";
import Models from "../models/index.models";
import { Op } from "sequelize";

// * Tipagem para os dados de inclusão
export type DadosUsuario = {
  id?: string;
  nome: string;
  sobrenome: string;
  nacionalidade: string;
  dt_nascimento: Date;
  cpf: string;
  nickname: string;
  senha: string;
  email: string;
  telefone: string;
};

// * Classe com os métodos da service
class UsuarioService {
  // Função assíncrona de buscar todos
  public async buscarTodos(): Promise<Usuario[] | null> {
    try {
      let usuarios = await Models.Usuarios.findAll({
        attributes: ["id", "nickname"],
        include: [
          {
            model: Models.Pessoas,
            as: "pessoa",
            attributes: ["nome", "sobrenome", "nacionalidade", "email", "telefone", "dt_nascimento"],
            where: { is_ativo: true }
          }
        ],
      });
      return usuarios;
    } catch (error: any) {
      throw error;
    }
  }

  public async buscarResumido(eu: string | null = null): Promise<any> {
    try {
      let usuarios: Usuario[] = []
      if (!eu) {
        usuarios = await Models.Usuarios.findAll({
          attributes: ['nickname', 'dt_criacao'],
          order: [['nickname', 'ASC']],
          include: {
            model: Models.Pessoas,
            as: 'pessoa',
            attributes: ['nacionalidade', 'dt_nascimento', 'email'],
            where: { is_ativo: true }
          }
        })
      } else {
        usuarios = await Models.Usuarios.findAll({
          attributes: ['nickname', 'dt_criacao'],
          order: [['nickname', 'ASC']],
          where: { id: { [Op.not]: eu } },
          include: {
            model: Models.Pessoas,
            as: 'pessoa',
            attributes: ['nacionalidade', 'dt_nascimento', 'email'],
            where: { is_ativo: true }
          }
        })
      }
      return usuarios;
    } catch (e) {
      throw e;
    }
  }

  // * função de adição do usuário
  public async add(dados: DadosUsuario): Promise<boolean | null> {
    const transaction = await sequelize.transaction();
    try {
      let pessoa = await Models.Pessoas.create(
        {
          nome: dados.nome,
          sobrenome: dados.sobrenome,
          nacionalidade: dados.nacionalidade,
          email: dados.email,
          telefone: dados.telefone,
          dt_nascimento: dados.dt_nascimento,
          cpf: dados.cpf,
        },
        { transaction }
      );

      if (pessoa) {
        let usuario = await Models.Usuarios.create(
          {
            nickname: dados.nickname,
            senha: dados.senha,
            pessoa_id: pessoa.dataValues.id,
          },
          { transaction }
        );
        transaction.commit();
        return true;
      } else {
        transaction.rollback();
        return false;
      }
    } catch (error: any) {
      if (error.name == 'SequelizeUniqueConstraintError') {
        throw new Error("ERR_NICKNAME_ALREADY_TAKEN")
      }
      throw error;
    }
  }

  public async login(dados: { nickname: string; senha: string; }): Promise<any | null> {
    try {
      let usuario: any = await Models.Usuarios.findOne({
        where: { nickname: dados.nickname },
        attributes: ["id", "nickname", "senha"],
        include: [
          {
            model: Models.Pessoas, as: "pessoa",
            attributes: ["email", "nome", "sobrenome"],
            where: { is_ativo: true }
          },
        ],
      });
      if (usuario && usuario.dataValues.id) {
        if (!await criptoService.verifyPassword(dados.senha, usuario.dataValues.senha)) {
          return null;
        }
        await usuario.update({ ultimo_login: Date.now() })
        let usuarioData = {
          id: usuario.dataValues.id,
          nome: usuario.dataValues.pessoa.nome + ' ' + usuario.dataValues.pessoa.sobrenome,
          nickname: usuario.dataValues.nickname,
          email: usuario.dataValues.pessoa.email
        }
        return usuarioData;
      } else {
        return null;
      }
    } catch (error: any) {
      throw error;
    }
  }

  public async alteraSenha(id: string, senha: string): Promise<boolean> {
    try {
      return false;
    } catch (erro: any) {
      throw erro;
    }
  }

  public async update(dados: any): Promise<boolean | null> {
    const transaction = await sequelize.transaction();
    try {
      let usuario = await Models.Usuarios.findByPk(dados.id, { transaction });
      let pessoa = await Models.Pessoas.findByPk(usuario?.dataValues.pessoa_id, { transaction });
      if (usuario && pessoa) {
        await usuario.update({ nickname: dados.nickname }, { transaction })
        await pessoa.update({
          email: dados.email,
          telefone: dados.telefone,
          nacionalidade: dados.nacionalidade,
          dt_nascimento: dados.dt_nascimento
        }, { transaction })
        transaction.commit()
        return true;
      }
      transaction.rollback()
      return false;
    } catch (error: any) {
      transaction.rollback()
      throw error;
    }
  }

  public async delete(id: string): Promise<boolean> {
    let transaction = await sequelize.transaction()
    try {
      let usuario = await Models.Usuarios.findByPk(id, { transaction });
      let pessoa = await Models.Pessoas.findByPk(usuario?.dataValues.pessoa_id, { transaction })
      if (pessoa) {
        await pessoa.update({ is_ativo: false }, { transaction })
        transaction.commit()
        return true;
      } else {
        transaction.rollback()
        return false;
      }
      return false;
    } catch (erro: any) {
      transaction.rollback()
      throw erro;
    }
  }

  public async buscarPorId(id: string): Promise<boolean | Usuarios | null> {
    if (!id) return false;
    try {
      let usuario = Models.Usuarios.findByPk(id, {
        attributes: ['id', 'nickname', 'ultima_altera_senha', 'dt_criacao'],
        include: {
          model: Models.Pessoas,
          as: 'pessoa',
          attributes: ['id', 'nome', 'sobrenome', 'cpf', 'is_ativo', 'nacionalidade', 'telefone', 'email', "dt_nascimento"],
          where: { is_ativo: true }
        }
      })
      return usuario;
    } catch (e) {
      return false;
    }
  }

  // * Busca todos os dados necessários para o painel do jogador
  public async getDadosDashboard(usuarioId: string): Promise<any> {
    try {
      // 1. Dados básicos do perfil
      const usuario: any = await Models.Usuarios.findByPk(usuarioId, {
        attributes: ['id', 'nickname', 'dt_criacao'],
        include: {
          model: Models.Pessoas,
          as: 'pessoa',
          attributes: ['nome', 'sobrenome', 'email', 'nacionalidade'],
          where: { is_ativo: true }
        }
      });

      if (!usuario) throw new Error('USUARIO_NAO_ENCONTRADO');

      // 2. Torneios ativos (inscritos e não finalizados)
      const torneiosAtivos: any[] = await Models.Torneios.findAll({
        attributes: ['id', 'nome', 'dt_inicio'],
        where: { dt_fim: null },
        include: [
          {
            model: Models.Participantes,
            as: 'participantes',
            where: { usuario_id: usuarioId },
            attributes: ['status'],
          },
          {
            model: Models.Jogos,
            as: 'jogo',
            attributes: ['nome']
          },
          {
            model: Models.Usuarios,
            as: 'responsavel',
            attributes: ['nickname'],
            include: [{
              model: Models.Pessoas,
              as: 'pessoa',
              attributes: ['nome', 'sobrenome']
            }]
          }
        ],
        order: [['dt_inicio', 'DESC']]
      });

      // 3. Histórico de torneios finalizados
      const historicoTorneios: any[] = await Models.Torneios.findAll({
        attributes: ['id', 'nome', 'dt_inicio', 'dt_fim'],
        where: { dt_fim: { [Op.not]: null } },
        include: [
          {
            model: Models.Participantes,
            as: 'participantes',
            where: { usuario_id: usuarioId },
            attributes: ['status'],
          },
          {
            model: Models.Jogos,
            as: 'jogo',
            attributes: ['nome']
          }
        ],
        order: [['dt_fim', 'DESC']]
      });

      // 4. Equipes do jogador
      const equipes: any[] = await Models.Equipes.findAll({
        attributes: ['id', 'nome'],
        where: { is_ativo: true },
        include: [{
          model: Models.Usuarios,
          as: 'membros',
          attributes: ['nickname'],
          through: {
            attributes: ['funcao', 'is_lider', 'is_titular'],
            where: {
              is_ativo: true,
              dt_aceito: { [Op.not]: null },
              dt_saida: { [Op.is]: null },
              usuario_id: usuarioId
            }
          }
        }]
      });

      // 5. Convites pendentes
      const convites: any[] = await Models.Equipes.findAll({
        attributes: ['id', 'nome'],
        where: { is_ativo: true },
        include: [{
          model: Models.MembrosEquipe,
          as: 'associacoesMembro',
          where: {
            dt_aceito: { [Op.is]: null },
            dt_saida: { [Op.is]: null },
            usuario_id: usuarioId
          }
        }]
      });

      // Formata e retorna tudo junto
      return {
        perfil: {
          id: usuario.dataValues.id,
          nickname: usuario.dataValues.nickname,
          nome: `${usuario.dataValues.pessoa.nome} ${usuario.dataValues.pessoa.sobrenome}`,
          email: usuario.dataValues.pessoa.email,
          nacionalidade: usuario.dataValues.pessoa.nacionalidade,
          membro_desde: usuario.dataValues.dt_criacao,
        },
        torneios_ativos: torneiosAtivos.map((t: any) => ({
          id_torneio: t.id,
          nome_torneio: t.nome,
          data_realizacao: t.dt_inicio,
          nome_jogo: t.jogo?.nome || 'N/A',
          organizador: t.responsavel?.pessoa
            ? `${t.responsavel.pessoa.nome} ${t.responsavel.pessoa.sobrenome}`
            : t.responsavel?.nickname || 'N/A',
          status_inscricao: t.participantes?.[0]?.status || 'INSCRITO'
        })),
        historico: historicoTorneios.map((t: any) => ({
          id_torneio: t.id,
          nome_torneio: t.nome,
          data_realizacao: t.dt_inicio,
          data_finalizacao: t.dt_fim,
          nome_jogo: t.jogo?.nome || 'N/A',
          status_inscricao: 'FINALIZADO'
        })),
        equipes: equipes
          .filter((e: any) => e.membros && e.membros.length > 0)
          .map((e: any) => ({
            id: e.id,
            nome: e.nome,
            is_lider: e.membros[0]?.MembrosEquipe?.is_lider || false,
            funcao: e.membros[0]?.MembrosEquipe?.funcao || null
          })),
        convites: convites.map((c: any) => ({
          id: c.id,
          nome: c.nome
        }))
      };
    } catch (error: any) {
      throw error;
    }
  }
}

// Export ao serviço para ser usado no controller
export default new UsuarioService();