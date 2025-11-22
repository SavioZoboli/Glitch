import { randomUUID } from "crypto";
import { sequelize } from "../config/database.config";
import models from "../models/index.models";
import { ChaveamentosAtributos } from "../models/torneios/chaveamentos.model";
import { EtapasPartidaAtributos } from "../models/torneios/etapasPartida.model";
import { ParticipantesAtributos } from "../models/torneios/participantes.model";
import { PartidasAtributos } from "../models/torneios/partidas.model";

export class TorneioService {

    async addTorneio(dados: any): Promise<any> {
        let transaction = await sequelize.transaction();
        try {

            let usuario = await models.Usuarios.findOne({ where: { nickname: dados.usuario_responsavel }, transaction })
            if (!usuario) {
                return 404;
            }
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
                    required:false,
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
        // Inicia a transação
        let transaction = await sequelize.transaction();

        try {
            // 1. Busca e valida o torneio
            let torneio = await models.Torneios.findByPk(id, { transaction });

            if (!torneio) {
                await transaction.rollback(); // Boa prática: rollback se não for prosseguir
                return 404;
            }

            // 2. Remove configurações (se existirem)
            // Otimização: destroy com where é mais eficiente que findOne + destroy
            await models.ConfigsInscricao.destroy({
                where: { torneio_id: id },
                transaction
            });

            // 3. Busca todas as etapas
            let etapasPartida = await models.EtapasPartida.findAll({
                where: { torneio_id: id },
                transaction
            });

            // 4. Itera sobre as etapas (Substituindo forEach por for...of)
            for (const etapa of etapasPartida) {
                // AVISO: Usei findAll aqui. Se uma etapa tiver mais de uma partida, 
                // seu código original (findOne) deixaria lixo no banco.
                let partidas = await models.Partidas.findAll({
                    where: { etapa_id: etapa.dataValues.id }, // dataValues não é necessário aqui geralmente
                    transaction
                });

                for (const partida of partidas) {
                    // Remove Logs e Chaveamentos associados à partida
                    // Usando destroy({where}) para evitar buscar o objeto primeiro (economiza query)
                    await models.LogsPartida.destroy({
                        where: { partida_id: partida.dataValues.id },
                        transaction
                    });

                    await models.Chaveamentos.destroy({
                        where: { partida_id: partida.dataValues.id },
                        transaction
                    });

                    // Remove a partida
                    await partida.destroy({ transaction });
                }

                // Implementação solicitada: Destrói a etapa atual após limpar as filhas
                await etapa.destroy({ transaction });
            }

            // 5. Implementação solicitada: Destrói os participantes
            // É muito mais performático fazer um delete em massa pelo ID do torneio
            // do que buscar todos e fazer um loop.
            await models.Participantes.destroy({
                where: { torneio_id: id },
                transaction
            });

            // 6. Destrói o torneio
            await torneio.destroy({ transaction });

            // Confirma todas as alterações
            await transaction.commit();

            return 200;

        } catch (e) {
            // Desfaz tudo se houver erro
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
                    required:false,
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
            }, {
                where: { id: dados.id },
                transaction
            })
            await models.ConfigsInscricao.update({
                qtd_participantes_max: dados.inscricao.max_participantes,
                dt_fim: dados.inscricao.dt_fim,
                modo_inscricao: dados.inscricao.modo_inscricao
            }, {
                where: { torneio_id: dados.id }, transaction
            })

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

            let torneio = await models.Torneios.findByPk(torneio_id, {
                attributes: ['id'],
            })

            let configInscricao = await models.ConfigsInscricao.findOne({ where: { torneio_id: torneio?.dataValues.id } })

            let usuario = await models.Usuarios.findOne({
                where: { nickname },
                attributes: ['id']
            });


            if (!torneio || !usuario || !configInscricao) {
                return 404;
            }

            let countParticipantes = await models.Participantes.count({
                where: {
                    torneio_id: torneio?.dataValues.id
                }
            })

            if (countParticipantes < configInscricao.dataValues.qtd_participantes_max) {
                let participante = await models.Participantes.create({
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
                    ['ordem', 'ASC'], // Ordem das etapas (Oitavas, Quartas...)
                    [{ model: models.Partidas, as: 'partidas' }, 'dt_inicio', 'ASC'], // Dentro da etapa, ordena por horário
                    [{ model: models.Partidas, as: 'partidas' }, { model: models.Chaveamentos, as: 'chaveamentos' }, 'ordem', 'ASC'] // Ordem do jogo na chave
                ],
                include: [
                    {
                        model: models.Partidas,
                        as: 'partidas', // Alias definido no index.models.ts
                        include: [
                            {
                                model: models.Chaveamentos,
                                as: 'chaveamentos',
                                include: [
                                    // === PARTICIPANTE A ===
                                    {
                                        model: models.Participantes,
                                        as: 'participante_a',
                                        include: [
                                            {
                                                model: models.Usuarios,
                                                as: 'usuario',
                                                attributes: ['nickname'], // Só precisamos do nick
                                                include: [{
                                                    model: models.Pessoas,
                                                    as: 'pessoa',
                                                    attributes: ['nome', 'sobrenome'] // Só o nome real
                                                }]
                                            },
                                            {
                                                model: models.Equipes, // Caso seja torneio de times
                                                as: 'equipe',
                                                attributes: ['nome']
                                            }
                                        ]
                                    },
                                    // === PARTICIPANTE B ===
                                    {
                                        model: models.Participantes,
                                        as: 'participante_b',
                                        include: [
                                            {
                                                model: models.Usuarios,
                                                as: 'usuario',
                                                attributes: ['nickname'],
                                                include: [{
                                                    model: models.Pessoas,
                                                    as: 'pessoa',
                                                    attributes: ['nome', 'sobrenome']
                                                }]
                                            },
                                            {
                                                model: models.Equipes,
                                                as: 'equipe',
                                                attributes: ['nome']
                                            }
                                        ]
                                    },
                                    // === VENCEDOR (Opcional, mas útil) ===
                                    {
                                        model: models.Participantes,
                                        as: 'vencedor',
                                        attributes: ['id'] // Só pra saber quem levou
                                    }
                                ]
                            }
                        ]
                    }
                ]
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
            });
            return partida;
        } catch (e) {
            throw e;
        }
    }

    formatarSaidaRelatorio(dadosBrutos: any[]) {
        // Função auxiliar para extrair nome legível
        const getNomeParticipante = (participante: any) => {
            if (!participante) return "A definir / Bye";

            // Prioridade 1: Nome da Equipe
            if (participante.equipe) return participante.equipe.nome;

            // Prioridade 2: Nickname do Usuário
            if (participante.usuario) {
                const nick = participante.usuario.nickname;
                // Se quiser concatenar com nome real:
                // const nomeReal = participante.usuario.pessoa ? `${participante.usuario.pessoa.nome}` : '';
                return nick;
            }

            return "Participante Desconhecido";
        };

        return dadosBrutos.map(etapa => ({
            id:etapa.id,
            etapa: etapa.tipo_etapa, // Ex: "RODADA 1", "FINAL"
            ordem_etapa: etapa.ordem,
            status_etapa: etapa.is_concluida ? "Concluída" : "Em Andamento",
            partidas: etapa.partidas.map((partida: any) => ({
                id_partida: partida.id,
                data_inicio: new Date(partida.dt_inicio),
                status_partida: partida.situacao, // Ex: "AGENDADA"
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
            if (!torneio) {
                return 404;
            }

            let participantes = await models.Participantes.findAll(
                {
                    where: { torneio_id: torneio.dataValues.id },
                    transaction,
                    raw: true,
                    nest: true
                }) as unknown as ParticipantesAtributos[]

            if (!participantes) {
                return 404;
            }

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

        // 1. Preparação dos Participantes (Tratamento de Ímpar)
        // Clonamos para não alterar o original
        let pool = participantes.map(p => p.id);

        // Se for ímpar, adiciona um "null" (Bye/Folga)
        // Quem cair contra "null" descansa na rodada
        if (pool.length % 2 !== 0) {
            pool.push(null as any);
        }

        const totalJogadores = pool.length;
        const maxRodadasPossiveis = totalJogadores - 1;

        // Validação de integridade
        if (numRodadas > maxRodadasPossiveis) {
            throw new Error(`Impossível jogar ${numRodadas} rodadas únicas com apenas ${participantes.length} participantes.`);
        }

        const etapasGeradas: EtapasPartidaAtributos[] = [];
        const partidasGeradas: PartidasAtributos[] = [];
        const chaveamentosGerados: ChaveamentosAtributos[] = [];

        // 2. Algoritmo do Círculo (Round Robin)
        // Fixamos o índice 0 e rotacionamos o resto do array (índices 1 a N)

        for (let round = 0; round < numRodadas; round++) {

            // Cria a Etapa (Rodada 1, Rodada 2...)
            const etapaId = randomUUID();
            etapasGeradas.push({
                id: etapaId,
                torneio_id: torneioId,
                ordem: round + 1,
                tipo_etapa: `RODADA ${round + 1}`,
                is_concluida: false
            });

            // Divide o array em duas metades para parear:
            // Metade 1: [0, 1, 2]
            // Metade 2: [5, 4, 3] (Invertida para alinhar visualmente)
            const metade = totalJogadores / 2;

            for (let i = 0; i < metade; i++) {
                const p1 = pool[i];
                const p2 = pool[totalJogadores - 1 - i];

                // Se um dos dois for null, é um Bye (Folga).
                // Dependendo da regra, você pode não gerar a partida, ou gerar como "Vitoria Automatica".
                // Para simplificar e manter histórico, vamos gerar apenas se AMBOS existirem.
                // Se um for null, o jogador real ganha folga (não gera registro ou gera registro de folga).

                if (p1 && p2) {
                    const partidaId = randomUUID();

                    partidasGeradas.push({
                        id: partidaId,
                        etapa_id: etapaId,
                        dt_inicio: new Date(), // Pode somar +20min para cada rodada se quiser
                        situacao: 'AGENDADA'
                    });

                    chaveamentosGerados.push({
                        id: randomUUID(),
                        partida_id: partidaId,
                        participante_a_id: p1,
                        participante_b_id: p2,
                        vencedor_id: undefined, // Define depois baseada na pontuação
                        ordem: i + 1,
                        placar_a: 0,
                        placar_b: 0,
                        criterio_desempate: 'PONTOS',
                        is_a_pronto: true, // Já nascem prontos, não dependem de ninguém
                        is_b_pronto: true
                    });
                }
                // Opcional: Else logar quem ficou de folga nesta rodada
            }

            // 3. Rotação do Array (Mantém o índice 0 fixo, gira o resto)
            // Ex: [0, 1, 2, 3] -> Tira o ultimo (3) e insere na pos 1 -> [0, 3, 1, 2]
            const fixo = pool[0];
            const resto = pool.slice(1);

            const ultimo = resto.pop(); // Tira o último
            if (ultimo) resto.unshift(ultimo); // Põe no começo do sub-array

            pool = [fixo, ...resto];
        }

        return { etapasGeradas, partidasGeradas, chaveamentosGerados };
    }

    async finalizarTorneio(torneio_id:string):Promise<any>{
        try{
            let torneio = await models.Torneios.update({
                dt_fim:new Date()
            },{where:{id:torneio_id}})
            return true;
        }catch(e){
            throw e;
        }
    }



}


export default new TorneioService()