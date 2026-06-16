import { randomInt, randomUUID } from "crypto";
import { Op, Transaction } from "sequelize";
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
                throw new Error("ERR_404")
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

    private nomearEtapaPorQuantidade(quantidadeParticipantes: number, ordem: number): string {
        switch (quantidadeParticipantes) {
            case 2:
                return "FINAL";
            case 4:
                return "SEMIFINAL";
            default:
                return `RODADA ${ordem}`;
        }
    }

    private embaralharParticipantes(ids: string[]): string[] {
        const arr = [...ids];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = randomInt(i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    private async buscarParticipantesAtivosMataMata(torneio_id: string, transaction: Transaction): Promise<string[]> {
        const participantesAprovados = (await models.Participantes.findAll({
            attributes: ["id"],
            where: { torneio_id, status: "APROVADO" },
            order: [["dt_inscricao", "ASC"], ["id", "ASC"]],
            transaction,
            raw: true,
        })) as unknown as Array<{ id: string }>;

        const todosParticipantes = participantesAprovados.map((p) => p.id);
        if (todosParticipantes.length === 0) return [];

        const confrontosComVencedor = await models.Chaveamentos.findAll({
            attributes: ["participante_a_id", "participante_b_id", "vencedor_id"],
            where: { vencedor_id: { [Op.not]: null } as any },
            include: [
                {
                    model: models.Partidas,
                    as: "partida",
                    attributes: ["id"],
                    include: [
                        {
                            model: models.EtapasPartida,
                            as: "etapa",
                            attributes: ["id"],
                            where: { torneio_id },
                        },
                    ],
                },
            ],
            transaction,
        });

        const eliminados = new Set<string>();
        for (const confronto of confrontosComVencedor as any[]) {
            const a = confronto?.participante_a_id as string;
            const b = confronto?.participante_b_id as string;
            const vencedor = confronto?.vencedor_id as string | null;

            if (!a || !b || !vencedor) continue;
            if (vencedor === a) eliminados.add(b);
            else if (vencedor === b) eliminados.add(a);
        }

        return todosParticipantes.filter((id) => !eliminados.has(id));
    }

    private async gerarProximaEtapaMataMata(etapa_id: string, transaction: Transaction): Promise<any> {
        const etapaAtual = await models.EtapasPartida.findByPk(etapa_id, { transaction });
        if (!etapaAtual) {
            throw new Error("Etapa nao encontrada");
        }

        const proximaOrdem = etapaAtual.dataValues.ordem + 1;
        const torneio_id = etapaAtual.dataValues.torneio_id;

        const proximaEtapaJaExiste = await models.EtapasPartida.count({
            where: { torneio_id, ordem: proximaOrdem },
            transaction,
        });
        if (proximaEtapaJaExiste > 0) {
            return { gerouProximaEtapa: false, campeaoId: null };
        }

        const ativos = await this.buscarParticipantesAtivosMataMata(torneio_id, transaction);
        if (ativos.length === 0) {
            throw new Error("Nao foi possivel determinar participantes ativos no mata-mata");
        }

        if (ativos.length === 1) {
            await models.Torneios.update(
                { dt_fim: new Date() },
                { where: { id: torneio_id, dt_fim: null }, transaction },
            );
            return { gerouProximaEtapa: false, campeaoId: ativos[0] };
        }

        const participantesParaConfronto = this.embaralharParticipantes(ativos);
        let byeParticipanteId: string | null = null;
        if (participantesParaConfronto.length % 2 !== 0) {
            byeParticipanteId = participantesParaConfronto.shift() ?? null;
        }

        const proximaEtapaId = randomUUID();
        await models.EtapasPartida.create(
            {
                id: proximaEtapaId,
                torneio_id,
                ordem: proximaOrdem,
                tipo_etapa: this.nomearEtapaPorQuantidade(ativos.length, proximaOrdem),
                is_concluida: false,
            },
            { transaction },
        );

        const partidasGeradas: any[] = [];
        const chaveamentosGerados: any[] = [];

        for (let i = 0; i < participantesParaConfronto.length; i += 2) {
            const participanteA = participantesParaConfronto[i];
            const participanteB = participantesParaConfronto[i + 1];
            const partidaId = randomUUID();

            partidasGeradas.push({
                id: partidaId,
                etapa_id: proximaEtapaId,
                dt_inicio: new Date(),
                situacao: "AGENDADA",
            });

            chaveamentosGerados.push({
                id: randomUUID(),
                partida_id: partidaId,
                participante_a_id: participanteA,
                participante_b_id: participanteB,
                vencedor_id: undefined,
                ordem: i / 2 + 1,
                placar_a: 0,
                placar_b: 0,
                criterio_desempate: "PONTOS",
                is_a_pronto: true,
                is_b_pronto: true,
            });
        }

        await models.Partidas.bulkCreate(partidasGeradas, { transaction });
        await models.Chaveamentos.bulkCreate(chaveamentosGerados, { transaction });

        return {
            gerouProximaEtapa: true,
            campeaoId: null,
            etapaId: proximaEtapaId,
            byeParticipanteId,
        };
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

            await this.finalizaEtapa(etapa_id, transaction)
            await transaction.commit()
        } catch (e) {
            await transaction.rollback()
            throw e;
        }
    }

    async todasPartidasFinalizadas(etapa_id: string, transaction?: Transaction): Promise<boolean> {
        try {
            let countEtapas = await models.EtapasPartida.count({ where: { id: etapa_id }, transaction })
            if (countEtapas != 1) {
                throw new Error("Etapa nao encontrada")
            }
            let partidas = await models.Partidas.findAll({
                where: { etapa_id, situacao: { [Op.not]: 'FINALIZADA' } },
                transaction,
            });
            return partidas.length == 0
        } catch (e) {
            throw e
        }
    }

    async finalizaEtapa(etapa_id: string, transaction?: Transaction): Promise<any> {
        const possuiTransacaoExterna = !!transaction;
        const tx = transaction ?? await sequelize.transaction();
        try {

            if (await this.todasPartidasFinalizadas(etapa_id, tx)) {
                await models.EtapasPartida.update({
                    is_concluida: true
                }, { where: { id: etapa_id }, transaction: tx })

                const resultado = await this.gerarProximaEtapaMataMata(etapa_id, tx)

                if (!possuiTransacaoExterna) {
                    await tx.commit();
                }
                return { etapaFinalizada: true, ...resultado };
            }

            if (!possuiTransacaoExterna) {
                await tx.commit();
            }

            return false;
        } catch (e) {
            if (!possuiTransacaoExterna) {
                await tx.rollback();
            }
            throw e
        }
    }


}

export default new PartidaService();
