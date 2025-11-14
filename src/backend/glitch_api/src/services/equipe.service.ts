import { col, fn, literal } from "sequelize";
import { sequelize } from "../config/database.config";
import models from "../models/index.models";
import { Op } from "sequelize";
import { MembrosEquipeAtributos } from "../models/pessoas/membrosEquipe.model";






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
                where:{is_ativo:true},
            })
            return equipes
        } catch (e) {
            return e;
        }
    }

    public async getEquipes(): Promise<any> {
        try {
            let resposta = await models.Equipes.findAll({
                attributes: ['id', 'nome'],
                where:{is_ativo:true},
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

    public async getEquipePorId(id: string): Promise<any> {
        try {
            let resposta = await models.Equipes.findByPk(id, {
                attributes: ['id', 'nome'],
                include: [{
                    model: models.Usuarios,
                    as: 'membros', // O 'as' da sua associação Equipes -> Usuarios
                    attributes: ['nickname'],
                    through: {
                        // 'through' permite acessar o modelo MembrosEquipe
                        attributes: ['funcao', 'is_lider', 'is_titular','dt_aceito'],
                        where: {
                            // Aplicando seu 'where' diretamente na tabela 'through'
                            is_ativo: true,
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
                where:{is_ativo:true},
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

    async updateEquipe(id: string, novo_nome: string): Promise<any> {
        let transaction = await sequelize.transaction()
        try {
            let possivel_equipe = await models.Equipes.findOne({ where: { nome: novo_nome } })
            if (possivel_equipe) {
                return '400';
            }
            let equipe = await models.Equipes.findByPk(id)
            if (!equipe) {
                return '404'
            }
            await equipe.update({ nome: novo_nome }, { transaction })
            await transaction.commit()
            return '200'
        } catch (e) {
            await transaction.rollback()
            return e;
        }
    }

    async updateMembro(membro: any,equipe:string): Promise<any> {
        let transaction = await sequelize.transaction()
        try {
            let usuario = await models.Usuarios.findOne({where:{nickname:membro.nickname}})
            let membroEquipe = await models.MembrosEquipe.findOne({ where: { usuario_id: usuario?.dataValues.id, equipe_id: equipe} })
            if (!membroEquipe) {
                return '404'
            }
            await membroEquipe.update({ is_titular: membro.is_titular, is_lider: membro.is_lider, funcao: membro.funcao }, { transaction })
            await transaction.commit()
            return '200'
        } catch (e) {
            await transaction.rollback()
            console.error(e)
            return e;
        }
    }

    async removeEquipe(id: string): Promise<any> {
        const transaction = await sequelize.transaction();
        try {
            const equipe = await models.Equipes.findByPk(id, {
                transaction,
                attributes: ['id']
            });

            if (!equipe) {
                await transaction.rollback();
                return '404';
            }
            await Promise.all([
                // Atualiza TODOS os membros com uma única query SQL eficiente
                models.MembrosEquipe.update(
                    { is_ativo: false },
                    { where: { equipe_id: id }, transaction }
                ),
                // Atualiza a equipe. 
                models.Equipes.update(
                    { is_ativo: false },
                    { where: { id: id }, transaction }
                )
            ]);

            // Passo 3: Efetivação
            await transaction.commit();
            return { success: true, message: 'Equipe e membros removidos com sucesso' };

        } catch (e) {
            await transaction.rollback();
            console.error("Erro ao remover equipe:", e);
            throw e;
        }
    }

    async removeMembro(membro: any,equipe:string): Promise<any> {
        let transaction = await sequelize.transaction()
        try {
            let usuario = await models.Usuarios.findOne({where:{nickname:membro.nickname}})
            let membroEquipe = await models.MembrosEquipe.findOne({where:{equipe_id:equipe,usuario_id:usuario?.dataValues.id},transaction})
            if(!membroEquipe){
                await transaction.rollback()
                return '404'
            }
            await membroEquipe.update({is_ativo:false})
            await transaction.commit()
            return '200'
        } catch (e) {
            await transaction.rollback();
            console.error("Erro ao remover equipe:", e);
            throw e;
        }
    }

}

export default new UsuarioService();