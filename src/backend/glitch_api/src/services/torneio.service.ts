import { randomUUID } from "crypto";
import { sequelize } from "../config/database.config";
import models from "../models/index.models";
import { ChaveamentosAtributos } from "../models/torneios/chaveamentos.model";
import { EtapasPartidaAtributos } from "../models/torneios/etapasPartida.model";
import { ParticipantesAtributos } from "../models/torneios/participantes.model";
import { PartidasAtributos } from "../models/torneios/partidas.model";
import { Op } from "sequelize";

export class TorneioService {

    async addTorneio(dados: any): Promise<any> {
        let transaction = await sequelize.transaction();
        try {
            let usuario = await models.Usuarios.findOne({ where: { nickname: dados.usuario_responsavel }, transaction })
            if (!usuario) return 404;
            let torneio = await models.Torneios.create({
                jogo_id: dados.jogo_id,
                usuario_responsavel_id: usuario.dataValues.id,
                nome: dados.nome,
                descricao: dados.descricao,
                dt_inicio: dados.dt_inicio
            }, { transaction })
            if (torneio) {
                let configInscricao = await models.ConfigsInscricao.create({
                    torneio_id: torneio.dataValues.id,
                    dt_inicio: new Date(),
                    dt_fim: dados.inscricao.dt_fim,
                    qtd_participantes_max: dados.inscricao.max_participantes,
                    modo_inscricao: dados.inscricao.modo_inscricao
                }, { transaction })
                if (configInscricao) {
                    await transaction.commit()
                    return 200
                }
                transaction.rollback()
                return 500
            }
            transaction.rollback()
            return 500
        } catch (e) {
            transaction.rollback()
            console.error(e)
            throw e;
        }
    }

    async getAllTorneios(): Promise<any> {
        try {
            let torneios = await models.Torneios.findAll({
                attributes: [['id', 'codigo'], 'nome', 'descricao', 'dt_inicio', 'dt_fim'],
                include: [{
                    model: models.Jogos,
                    as: 'jogo',
                    attributes: ['nome', 'class_indicativa']
                }, {
                    model: models.Usuarios,
                    as: 'responsavel',
                    attributes: [['nickname', 'organizador']]
                }, {
                    model: models.ConfigsInscricao,
                    as: 'configuracao_inscricao',
                    attributes: ['dt_inicio', 'dt_fim', 'qtd_participantes_max', 'modo_inscricao']
                }, {
                    model: models.Participantes,
                    as: 'participantes',
                    attributes: ['status'],
                    where: { status: 'APROVADO' },
                    required: false,
                    include: [{
                        model: models.Usuarios,
                        as: 'usuario',
                        attributes: ['nickname']
                    }]
                }]
            })
            return torneios;
        } catch (e) {
            return e;
        }
    }

    async removeTorneio(id: string): Promise<any> {
        let transaction = await sequelize.transaction();
        try {
            let torneio = await models.Torneios.findByPk(id, { transaction });
            if (!torneio) {
                await transaction.rollback();
                return 404;
            }
            await models.ConfigsInscricao.destroy({ where: { torneio_id: id }, transaction });
            let etapasPartida = await models.EtapasPartida.findAll({ where: { torneio_id: id }, transaction });
            for (const etapa of etapasPartida) {
                let partidas = await models.Partidas.findAll({ where: { etapa_id: etapa.dataValues.id }, transaction });
                for (const partida of partidas) {
                    await models.LogsPartida.destroy({ where: { partida_id: partida.dataValues.id }, transaction });
                    await models.Chaveamentos.destroy({ where: { partida_id: partida.dataValues.id }, transaction });
                    await partida.destroy({ transaction });
                }
                await etapa.destroy({ transaction });
            }
            await models.Participantes.destroy({ where: { torneio_id: id }, transaction });
            await torneio.destroy({ transaction });
            await transaction.commit();
            return 200;
        } catch (e) {
            if (transaction) await transaction.rollback();
            console.log(e)
            throw e;
        }
    }

    async getTorneioById(id: string): Promise<any> {
        try {
            let torneio = await models.Torneios.findByPk(id, {
                attributes: [['id', 'codigo'], 'nome', 'descricao', 'dt_inicio', 'dt_fim'],
                include: [{
                    model: models.Jogos,
                    as: 'jogo',
                    attributes: ['nome', 'class_indicativa']
                }, {
                    model: models.Usuarios,
                    as: 'responsavel',
                    attributes: [['nickname', 'organizador']]
                }, {
                    model: models.ConfigsInscricao,
                    as: 'configuracao_inscricao',
                    attributes: ['dt_inicio', 'dt_fim', 'qtd_participantes_max', 'modo_inscricao']
                }, {
                    model: models.Participantes,
                    as: 'participantes',
                    where: { status: 'APROVADO' },
                    attributes: ['status', 'dt_inscricao'],
                    required: false,
                    include: [{
                        model: models.Usuarios,
                        as: 'usuario',
                        attributes: ['nickname']
                    }]
                }]
            })
            return torneio;
        } catch (e) {
            return e;
        }
    }

    async updateTorneio(dados: any): Promise<any> {
        let transaction = await sequelize.transaction()
        try {
            await models.Torneios.update({
                nome: dados.nome,
                descricao: dados.descricao,
                dt_inicio: dados.dt_inicio,
            }, { where: { id: dados.id }, transaction })
            await models.ConfigsInscricao.update({
                qtd_participantes_max: dados.inscricao.max_participantes,
                dt_fim: dados.inscricao.dt_fim,
                modo_inscricao: dados.inscricao.modo_inscricao
            }, { where: { torneio_id: dados.id }, transaction })
            await transaction.commit()
            return true;
        } catch (e) {
            await transaction.rollback()
            throw e
        }
    }

    async ingressarEmTorneio(torneio_id: string, nickname: string): Promise<any> {
        let transaction = await sequelize.transaction();
        try {
            let torneio = await models.Torneios.findByPk(torneio_id, { attributes: ['id'] })
            let configInscricao = await models.ConfigsInscricao.findOne({ where: { torneio_id: torneio?.dataValues.id } })
            let usuario = await models.Usuarios.findOne({ where: { nickname }, attributes: ['id'] });
            if (!torneio || !usuario || !configInscricao) return 404;
            let countParticipantes = await models.Participantes.count({ where: { torneio_id: torneio?.dataValues.id } })
            if (countParticipantes < configInscricao.dataValues.qtd_participantes_max) {
                await models.Participantes.create({
                    torneio_id: torneio.dataValues.id,
                    usuario_id: usuario.dataValues.id,
                    dt_inscricao: new Date(),
                    dt_confirmacao: new Date(),
                    status: "APROVADO"
                }, { transaction })
                await transaction.commit()
                return 200;
            }
            return 400
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    async getPartidasTorneio(torneio: string) {
        try {
            const relatorio = await models.EtapasPartida.findAll({
                where: { torneio_id: torneio },
                order: [
                    ['ordem', 'ASC'],
                    [{ model: models.Partidas, as: 'partidas' }, 'dt_inicio', 'ASC'],
                    [{ model: models.Partidas, as: 'partidas' }, { model: models.Chaveamentos, as: 'chaveamentos' }, 'ordem', 'ASC']
                ],
                include: [{
                    model: models.Partidas,
                    as: 'partidas',
                    include: [{
                        model: models.Chaveamentos,
                        as: 'chaveamentos',
                        include: [
                            {
                                model: models.Participantes, as: 'participante_a',
                                include: [
                                    { model: models.Usuarios, as: 'usuario', attributes: ['nickname'], include: [{ model: models.Pessoas, as: 'pessoa', attributes: ['nome', 'sobrenome'] }] },
                                    { model: models.Equipes, as: 'equipe', attributes: ['nome'] }
                                ]
                            },
                            {
                                model: models.Participantes, as: 'participante_b',
                                include: [
                                    { model: models.Usuarios, as: 'usuario', attributes: ['nickname'], include: [{ model: models.Pessoas, as: 'pessoa', attributes: ['nome', 'sobrenome'] }] },
                                    { model: models.Equipes, as: 'equipe', attributes: ['nome'] }
                                ]
                            },
                            { model: models.Participantes, as: 'vencedor', attributes: ['id'] }
                        ]
                    }]
                }]
            });
            return this.formatarSaidaRelatorio(relatorio);
        } catch (e) {
            throw e;
        }
    }

    async getPartidaTorneio(partida_id: string) {
        try {
            const partida = await models.Partidas.findByPk(partida_id, {
                include: [
                    {
                        model: models.EtapasPartida, as: 'etapa', attributes: ['id', 'tipo_etapa'],
                        include: [{ model: models.Torneios, as: 'torneio', attributes: ['nome'] }]
                    },
                    {
                        model: models.Chaveamentos, as: 'chaveamentos',
                        include: [
                            {
                                model: models.Participantes, as: 'participante_a',
                                include: [
                                    { model: models.Usuarios, as: 'usuario', attributes: ['nickname'], include: [{ model: models.Pessoas, as: 'pessoa', attributes: ['nome', 'sobrenome'] }] },
                                    { model: models.Equipes, as: 'equipe', attributes: ['nome'] }
                                ]
                            },
                            {
                                model: models.Participantes, as: 'participante_b',
                                include: [
                                    { model: models.Usuarios, as: 'usuario', attributes: ['nickname'], include: [{ model: models.Pessoas, as: 'pessoa', attributes: ['nome', 'sobrenome'] }] },
                                    { model: models.Equipes, as: 'equipe', attributes: ['nome'] }
                                ]
                            },
                            { model: models.Participantes, as: 'vencedor', attributes: ['id'] }
                        ]
                    }
                ],
                order: [[{ model: models.Chaveamentos, as: 'chaveamentos' }, 'ordem', 'ASC']]
            });
            return partida;
        } catch (e) {
            throw e;
        }
    }

    formatarSaidaRelatorio(dadosBrutos: any[]) {
        const getNomeParticipante = (participante: any) => {
            if (!participante) return "A definir / Bye";
            if (participante.equipe) return participante.equipe.nome;
            if (participante.usuario) return participante.usuario.nickname;
            return "Participante Desconhecido";
        };

        return dadosBrutos.map(etapa => ({
            id: etapa.id,
            etapa: etapa.tipo_etapa,
            ordem_etapa: etapa.ordem,
            status_etapa: etapa.is_concluida ? "Concluída" : "Em Andamento",
            partidas: etapa.partidas.map((partida: any) => ({
                id_partida: partida.id,
                data_inicio: new Date(partida.dt_inicio),
                status_partida: partida.situacao,
                confrontos: partida.chaveamentos.map((chave: any) => {
                    const nomeA = getNomeParticipante(chave.participante_a);
                    const nomeB = getNomeParticipante(chave.participante_b);
                    return {
                        id_chave: chave.id,
                        jogador_a: nomeA,
                        placar_a: chave.placar_a,
                        jogador_b: nomeB,
                        placar_b: chave.placar_b,
                        vencedor: chave.vencedor_id ? (chave.vencedor_id === chave.participante_a_id ? nomeA : nomeB) : "Em aberto",
                        status_pronto: chave.is_a_pronto && chave.is_b_pronto ? "Pronto para Jogar" : "Aguardando Definição"
                    };
                })
            }))
        }));
    }

    async gerarPartidas(torneio_id: string) {
        let transaction = await sequelize.transaction();
        try {
            let torneio = await models.Torneios.findByPk(torneio_id, { transaction })
            if (!torneio) return 404;
            let participantes = await models.Participantes.findAll({ where: { torneio_id: torneio.dataValues.id }, transaction, raw: true, nest: true }) as unknown as ParticipantesAtributos[]
            if (!participantes) return 404;
            let gerado = this.gerar(torneio_id, participantes);
            await models.EtapasPartida.bulkCreate(gerado.etapasGeradas, { transaction });
            await models.Partidas.bulkCreate(gerado.partidasGeradas, { transaction });
            await models.Chaveamentos.bulkCreate(gerado.chaveamentosGerados, { transaction });
            await transaction.commit()
            return 200
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    private gerar(torneioId: string, participantes: ParticipantesAtributos[], numRodadas: number = 1) {
        let pool = participantes.map(p => p.id);
        if (pool.length % 2 !== 0) pool.push(null as any);
        const totalJogadores = pool.length;
        const maxRodadasPossiveis = totalJogadores - 1;
        if (numRodadas > maxRodadasPossiveis) throw new Error(`Impossível jogar ${numRodadas} rodadas únicas com apenas ${participantes.length} participantes.`);

        const etapasGeradas: EtapasPartidaAtributos[] = [];
        const partidasGeradas: PartidasAtributos[] = [];
        const chaveamentosGerados: ChaveamentosAtributos[] = [];

        for (let round = 0; round < numRodadas; round++) {
            const etapaId = randomUUID();
            etapasGeradas.push({ id: etapaId, torneio_id: torneioId, ordem: round + 1, tipo_etapa: `RODADA ${round + 1}`, is_concluida: false });
            const metade = totalJogadores / 2;
            for (let i = 0; i < metade; i++) {
                const p1 = pool[i];
                const p2 = pool[totalJogadores - 1 - i];
                if (p1 && p2) {
                    const partidaId = randomUUID();
                    partidasGeradas.push({ id: partidaId, etapa_id: etapaId, dt_inicio: new Date(), situacao: 'AGENDADA' });
                    chaveamentosGerados.push({ id: randomUUID(), partida_id: partidaId, participante_a_id: p1, participante_b_id: p2, vencedor_id: undefined, ordem: i + 1, placar_a: 0, placar_b: 0, criterio_desempate: 'PONTOS', is_a_pronto: true, is_b_pronto: true });
                }
            }
            const fixo = pool[0];
            const resto = pool.slice(1);
            const ultimo = resto.pop();
            if (ultimo) resto.unshift(ultimo);
            pool = [fixo, ...resto];
        }
        return { etapasGeradas, partidasGeradas, chaveamentosGerados };
    }

    async finalizarTorneio(torneio_id: string): Promise<any> {
        try {
            await models.Torneios.update({ dt_fim: new Date() }, { where: { id: torneio_id } })
            return true;
        } catch (e) {
            throw e;
        }
    }

    async buscarTorneiosDoUsuario(usuarioId: string) {
        try {
            const torneios = await models.Torneios.findAll({
                attributes: ['id', 'nome', 'dt_inicio', 'dt_fim'],
                where: { dt_fim: null },
                include: [
                    { model: models.Participantes, as: 'participantes', where: { usuario_id: usuarioId }, attributes: [] },
                    { model: models.Jogos, as: 'jogo', attributes: ['nome'] },
                    { model: models.Usuarios, as: 'responsavel', attributes: ['nickname'], include: [{ model: models.Pessoas, as: 'pessoa', attributes: ['nome', 'sobrenome'] }] }
                ],
                order: [['dt_inicio', 'DESC']]
            });
            return torneios.map((t: any) => {
                const nomeJogo = t.jogo?.nome || 'Jogo Desconhecido';
                const responsavelObj = t.responsavel;
                const nomeOrganizador = responsavelObj?.pessoa
                    ? `${responsavelObj.pessoa.nome} ${responsavelObj.pessoa.sobrenome}`
                    : (responsavelObj?.nickname || 'Organizador não identificado');
                return { id_torneio: t.id, nome_torneio: t.nome, data_realizacao: t.dt_inicio, nome_jogo: nomeJogo, organizador: nomeOrganizador, status_inscricao: "INSCRITO" };
            });
        } catch (error) {
            console.error("Erro ao buscar torneios do usuário:", error);
            throw error;
        }
    }

    async getResultadosTorneios(): Promise<any> {
        try {
            const torneios = await models.Torneios.findAll({
                where: { dt_fim: { [Op.ne]: null } },
                attributes: [['id', 'codigo'], 'nome', 'dt_fim'],
                include: [
                    { model: models.Jogos, as: 'jogo', attributes: ['nome'] },
                    { model: models.Usuarios, as: 'responsavel', attributes: [['nickname', 'organizador']] },
                    {
                        model: models.EtapasPartida, as: 'etapas', attributes: ['id'],
                        include: [{
                            model: models.Partidas, as: 'partidas', attributes: ['id'],
                            include: [{
                                model: models.Chaveamentos, as: 'chaveamentos', attributes: ['vencedor_id', 'ordem'],
                                include: [{ model: models.Participantes, as: 'vencedor', attributes: ['id'], include: [{ model: models.Usuarios, as: 'usuario', attributes: ['nickname'] }] }]
                            }]
                        }]
                    }
                ],
                order: [['dt_fim', 'DESC']]
            });
            return torneios.map((t: any) => {
                let vencedor = 'A definir';
                for (const etapa of t.etapas || []) {
                    for (const partida of etapa.partidas || []) {
                        for (const chave of partida.chaveamentos || []) {
                            if (chave.vencedor?.usuario?.nickname) vencedor = chave.vencedor.usuario.nickname;
                        }
                    }
                }
                return { codigo: t.codigo, nome: t.nome, jogo: t.jogo?.nome, organizador: t.responsavel?.organizador, dt_fim: t.dt_fim, vencedor };
            });
        } catch (e) {
            throw e;
        }
    }

    async getRanking(): Promise<any> {
        try {
            const chaveamentos = await models.Chaveamentos.findAll({
                where: { vencedor_id: { [Op.ne]: null } as any },
                attributes: ['vencedor_id'],
                include: [{
                    model: models.Participantes, as: 'vencedor', attributes: ['usuario_id'],
                    include: [
                        { model: models.Usuarios, as: 'usuario', attributes: ['nickname'] },
                        { model: models.Torneios, as: 'torneio', attributes: ['jogo_id'], include: [{ model: models.Jogos, as: 'jogo', attributes: ['nome'] }] }
                    ]
                }]
            });
            const mapaVitorias: Record<string, { nickname: string, jogo: string, vitorias: number }> = {};
            for (const c of chaveamentos as any[]) {
                const nickname = c.vencedor?.usuario?.nickname;
                const jogo = c.vencedor?.torneio?.jogo?.nome || 'N/A';
                if (!nickname) continue;
                if (!mapaVitorias[nickname]) mapaVitorias[nickname] = { nickname, jogo, vitorias: 0 };
                mapaVitorias[nickname].vitorias++;
            }
            return Object.values(mapaVitorias).sort((a, b) => b.vitorias - a.vitorias).map((r, i) => ({ posicao: i + 1, ...r }));
        } catch (e) {
            throw e;
        }
    }

    // * Busca partidas finalizadas do jogador para o relatório do dashboard
    async getPartidasDoJogador(usuarioId: string): Promise<any> {
        try {
            // Busca todos os participantes do usuário
            const participantes = await models.Participantes.findAll({
                where: { usuario_id: usuarioId },
                attributes: ['id', 'torneio_id']
            });

            if (!participantes.length) return [];

            const participanteIds = participantes.map((p: any) => p.dataValues.id);

            // Busca chaveamentos finalizados onde o usuário participou (como A ou B)
            const chaveamentos = await models.Chaveamentos.findAll({
                where: {
                    [Op.or]: [
                        { participante_a_id: { [Op.in]: participanteIds } },
                        { participante_b_id: { [Op.in]: participanteIds } }
                    ],
                    vencedor_id: { [Op.not]: null } as any// Só partidas finalizadas
                },
                attributes: ['id', 'participante_a_id', 'participante_b_id', 'vencedor_id', 'placar_a', 'placar_b'],
                include: [
                    // Dados da partida
                    {
                        model: models.Partidas,
                        as: 'partida',
                        attributes: ['id', 'dt_inicio', 'dt_fim', 'situacao'],
                        where: { situacao: { [Op.ne]: 'AGENDADA' } }, // Só partidas que aconteceram
                        include: [{
                            model: models.EtapasPartida,
                            as: 'etapa',
                            attributes: ['tipo_etapa', 'ordem'],
                            include: [{
                                model: models.Torneios,
                                as: 'torneio',
                                attributes: ['id', 'nome', 'dt_fim'],
                                include: [{
                                    model: models.Jogos,
                                    as: 'jogo',
                                    attributes: ['nome']
                                }]
                            }]
                        }]
                    },
                    // Dados do participante A
                    {
                        model: models.Participantes,
                        as: 'participante_a',
                        attributes: ['id'],
                        include: [{
                            model: models.Usuarios,
                            as: 'usuario',
                            attributes: ['nickname']
                        }]
                    },
                    // Dados do participante B
                    {
                        model: models.Participantes,
                        as: 'participante_b',
                        attributes: ['id'],
                        include: [{
                            model: models.Usuarios,
                            as: 'usuario',
                            attributes: ['nickname']
                        }]
                    }
                ],
                order: [[{ model: models.Partidas, as: 'partida' }, 'dt_inicio', 'DESC']]
            });

            // Formata o retorno
            return chaveamentos.map((c: any) => {
                const euSouA = participanteIds.includes(c.dataValues.participante_a_id);
                const adversario = euSouA
                    ? c.participante_b?.usuario?.nickname || 'Desconhecido'
                    : c.participante_a?.usuario?.nickname || 'Desconhecido';
                const venceu = participanteIds.includes(c.dataValues.vencedor_id);

                return {
                    id_chaveamento: c.dataValues.id,
                    torneio: {
                        id: c.partida?.etapa?.torneio?.id || null,
                        nome: c.partida?.etapa?.torneio?.nome || 'N/A',
                        jogo: c.partida?.etapa?.torneio?.jogo?.nome || 'N/A',
                        finalizado: !!c.partida?.etapa?.torneio?.dt_fim
                    },
                    etapa: c.partida?.etapa?.tipo_etapa || 'N/A',
                    data_partida: c.partida?.dt_inicio || null,
                    adversario,
                    placar: euSouA
                        ? `${c.dataValues.placar_a} x ${c.dataValues.placar_b}`
                        : `${c.dataValues.placar_b} x ${c.dataValues.placar_a}`,
                    resultado: venceu ? 'VITÓRIA' : 'DERROTA'
                };
            });
        } catch (e) {
            throw e;
        }
    }
}

export default new TorneioService()