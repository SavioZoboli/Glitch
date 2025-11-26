import { Op } from "sequelize";
import { sequelize } from "../config/database.config";
import models from "../models/index.models";

export class PartidaService {

    async registraLog(vitima: string, culpado: string, partida: string, acao: string, motivo: string) {
        try {

            let usr_vitima = await models.Usuarios.findOne({ where: { nickname: vitima } })
            let usr_culpado = await models.Usuarios.findOne({ where: { nickname: culpado } })

            if (!usr_culpado || !usr_vitima) {
                return 404
            }

            let log = await models.LogsPartida.create({
                usuario_origem_id: usr_culpado.dataValues.id,
                usuario_destino_id: usr_vitima.dataValues.id,
                partida_id: partida,
                acao: acao,
                motivo: motivo,
                dt_log: new Date()
            })

            await log.reload({
                include: [
                    {
                        model: models.Usuarios,
                        as: 'usuario_origem', // Alias definido no index.models.ts
                        attributes: ['nickname'], // Traz o nick
                    },
                    {
                        model: models.Usuarios,
                        as: 'usuario_destino', // Alias definido no index.models.ts
                        attributes: ['nickname'],
                    }
                ]
            });

            return log;
        } catch (e) {
            throw e;
        }
    }

    async buscaLogs(partida: string) {
        try {
            let logs = await models.LogsPartida.findAll({
                where: { partida_id: partida },
                include: [
                    {
                        model: models.Usuarios,
                        as: 'usuario_origem', // Alias definido no index.models.ts
                        attributes: ['nickname'], // Traz o nick
                    },
                    {
                        model: models.Usuarios,
                        as: 'usuario_destino', // Alias definido no index.models.ts
                        attributes: ['nickname'],
                    }
                ]
            })
            return logs;
        } catch (e) {
            throw e;
        }
    }

    async alteraPontuacao(jogador: string, chave: string, pontuacao: number) {
        try {

            let chaveamento = await models.Chaveamentos.findByPk(chave)
            if (!chaveamento) {
                return 404
            }

            switch (jogador) {
                case chaveamento.dataValues.participante_a_id:
                    await chaveamento.update({
                        placar_a: pontuacao
                    })
                    break;
                case chaveamento.dataValues.participante_b_id:
                    await chaveamento.update({
                        placar_b: pontuacao
                    })
                    break;
                default:
                    return 404
            }

            return chaveamento;
        } catch (e) {
            throw e;
        }
    }

    async iniciarPartida(partida: string) {
        try {
            let partidaAtualizado = await models.Partidas.findByPk(partida)

            if (!partidaAtualizado) {
                return 404
            }

            await partidaAtualizado.update({
                situacao: "EM PROGRESSO",
                dt_inicio: new Date()
            }, { where: { id: partida } })

            await partidaAtualizado.reload({
                include: [
                    // 1. BUSCA O TORNEIO (Via Etapa)
                    {
                        model: models.EtapasPartida,
                        as: 'etapa', // Alias definido no index.models.ts
                        attributes: ['id', 'tipo_etapa'], // Traz dados da etapa se quiser
                        include: [
                            {
                                model: models.Torneios,
                                as: 'torneio', // Alias definido no index.models.ts
                                attributes: ['nome'] // <--- AQUI ESTÁ O QUE VOCÊ PEDIU
                            }
                        ]
                    },
                    // 2. BUSCA OS CHAVEAMENTOS (Mantido igual)
                    {
                        model: models.Chaveamentos,
                        as: 'chaveamentos',
                        include: [
                            {
                                model: models.Participantes,
                                as: 'participante_a',
                                include: [
                                    {
                                        model: models.Usuarios,
                                        as: 'usuario',
                                        attributes: ['nickname'],
                                        include: [{ model: models.Pessoas, as: 'pessoa', attributes: ['nome', 'sobrenome'] }]
                                    },
                                    { model: models.Equipes, as: 'equipe', attributes: ['nome'] }
                                ]
                            },
                            {
                                model: models.Participantes,
                                as: 'participante_b',
                                include: [
                                    {
                                        model: models.Usuarios,
                                        as: 'usuario',
                                        attributes: ['nickname'],
                                        include: [{ model: models.Pessoas, as: 'pessoa', attributes: ['nome', 'sobrenome'] }]
                                    },
                                    { model: models.Equipes, as: 'equipe', attributes: ['nome'] }
                                ]
                            },
                            { model: models.Participantes, as: 'vencedor', attributes: ['id'] }
                        ]
                    }
                ],
                order: [
                    [{ model: models.Chaveamentos, as: 'chaveamentos' }, 'ordem', 'ASC']
                ]
            })

            return partidaAtualizado;
        } catch (e) {
            throw e
        }
    }


    async finalizarPartida(etapa_id: string, partida_id: string, chave_id: string, vencedor_id: string): Promise<any> {
        let transaction = await sequelize.transaction();
        try {
            let partida = await models.Partidas.findByPk(partida_id, { transaction })
            let chave = await models.Chaveamentos.findByPk(chave_id, { transaction })
            let vencedor = await models.Participantes.findByPk(vencedor_id, { transaction })
            if (!partida || !chave || !vencedor) {
                throw new Error("Dados não encontrados")
            }

            if (chave.dataValues.participante_a_id != vencedor.dataValues.id && chave.dataValues.participante_b_id != vencedor.dataValues.id) {
                throw new Error("Vencedor não está na lista de participantes")
            }

            await chave.update({ vencedor_id: vencedor.dataValues.id }, { transaction })

            await partida.update({
                dt_fim: new Date(),
                situacao: "FINALIZADA"
            }, { transaction })

            await this.finalizaEtapa(etapa_id)
            await transaction.commit()
        } catch (e) {
            await transaction.rollback()
            throw e;
        }
    }

    async todasPartidasFinalizadas(etapa_id: string): Promise<boolean> {
        try {
            let countEtapas = await models.EtapasPartida.count({ where: { id: etapa_id } })
            if (countEtapas != 1) {
                throw new Error("Etapa não encontrada")
            }
            let partidas = await models.Partidas.findAll({ where: { etapa_id, situacao: { [Op.not]: 'FINALIZADA' } } });
            console.log(partidas)
            return partidas.length == 0
        } catch (e) {
            throw e
        }
    }

    async finalizaEtapa(etapa_id: string): Promise<any> {
        try {

            if (await this.todasPartidasFinalizadas(etapa_id)) {
                await models.EtapasPartida.update({
                    is_concluida: true
                }, { where: { id: etapa_id } })
                return true;
            }

            return false;
        } catch (e) {
            throw e
        }
    }


}

export default new PartidaService();