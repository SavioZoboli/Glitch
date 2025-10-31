import { col, fn, literal } from "sequelize";
import { sequelize } from "../config/database.config";
import models from "../models/index.models";
import { Op } from "sequelize";

class UsuarioService {
    public async addEquipe(nome: string, lider: string): Promise<any> {
        let transaction = await sequelize.transaction()
        try {
            let equipe = await models.Equipes.create({
                nome: nome, dt_criacao: new Date()
            }, { transaction })
            let membro = await models.MembrosEquipe.create({
                equipe_id: equipe.dataValues.id,
                usuario_id: lider,
                is_ativo: true,
                is_lider: true,
                is_titular: true,
                dt_convite: new Date(),
                dt_aceito: new Date()
            }, { transaction })
            transaction.commit()
            return equipe;
        } catch (e) {
            transaction.rollback()
            throw e;
        }
    }

    public async convidarJogador(equipe_id: string, nickname: string): Promise<any> {
        let transaction = await sequelize.transaction()
        try {
            let equipe = await models.Equipes.findByPk(equipe_id, { transaction })
            if (!equipe) {
                return new Error('NOT_FOUND')
            }

            let jogador = await models.Usuarios.findOne({ where: { nickname }, transaction })

            if (!jogador) {
                return new Error('NOT_FOUND')
            }

            let membro = await models.MembrosEquipe.create({
                equipe_id: equipe.dataValues.id,
                usuario_id: jogador.dataValues.id,
                is_ativo: true,
                is_lider: false,
                is_titular: false,
                dt_convite: new Date()
            }, { transaction })
            transaction.commit()
            return true;
        } catch (e) {
            transaction.rollback()
            return e
        }
    }

    public async getMinhasEquipes(usuario_id: string): Promise<any> {
        try {
            let equipes = await models.Equipes.findAll({
                attributes: [
                    'nome',
                    'dt_criacao',
                ],
                include: [{
                    model: models.MembrosEquipe,
                    as: 'equipes',
                    attributes: ['is_lider', 'is_titular'],
                    where: { is_ativo: true, dt_aceito: [Op.not, null], dt_saida: null, usuario_id },
                    include: [{
                        model: models.Usuarios,
                        as: 'membros',
                        attributes: ['nickname'],
                    }]
                },],
                where: {}
            })
            console.log(equipes)
            return equipes
        } catch (e) {
            return e;
        }
    }

    public async getEquipes(): Promise<any> {
        try {
            let resposta = await models.Equipes.findAll({
                attributes: ['id', 'nome'],
                include: [{
                    model: models.Usuarios,
                    as: 'membros', // O 'as' da sua associação Equipes -> Usuarios
                    attributes: ['nickname'],
                    through: {
                        // 'through' permite acessar o modelo MembrosEquipe
                        attributes: ['funcao', 'is_lider', 'is_titular'],
                        where: {
                            // Aplicando seu 'where' diretamente na tabela 'through'
                            is_ativo: true,
                            dt_aceito: {
                                [Op.not]: null
                            },
                            dt_saida: {
                                [Op.is]: null
                            }
                        }
                    }
                }]
            });
            return resposta
        } catch (e) {
            return e;
        }
    }

    public async getInvites(usuario_id: string): Promise<any> {
        try {
            let invites = await models.Equipes.findAll({
                attributes: ['id', 'nome'],
                include: [{
                    model: models.MembrosEquipe,
                    as: 'associacoesMembro',
                    where: [{
                        dt_aceito: { [Op.is]: null },
                        dt_saida: { [Op.is]: null },
                        usuario_id
                    }]
                }]
            })
            return invites
        } catch (e) {
            return e;
        }
    }

    public async answerInvite(usuario: string, equipe: string, resposta: boolean) {
        let transaction = await sequelize.transaction();
        try {
            let convite = await models.MembrosEquipe.findOne({
                where: {
                    usuario_id: usuario,
                    equipe_id: equipe,
                    dt_aceito: null,
                    dt_saida: null
                },
                transaction
            })
            if (!convite) {
                return 404;
            }
            if (resposta) {
                //Aceito
                await convite.update({
                    dt_aceito: new Date()
                }, { transaction })
            } else {
                //Recusado
                await convite.update({
                    dt_saida: new Date()
                }, { transaction })
            }
            await transaction.commit()
            return 200;
        } catch (e) {
            await transaction.rollback()
            return e
        }
    }

}

export default new UsuarioService();