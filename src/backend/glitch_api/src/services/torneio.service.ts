import { sequelize } from "../config/database.config";
import models from "../models/index.models";

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

    async getTorneioById(id:string):Promise<any>{
        try{
            let torneio = await models.Torneios.findByPk(id,{
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
                }]
            })
            return torneio;
        }catch(e){
            return e;
        }
    }

    async updateTorneio(dados:any):Promise<any>{
        let transaction = await sequelize.transaction()
        try{
            await models.Torneios.update({
                nome:dados.nome,
                descricao:dados.descricao,
                dt_inicio:dados.dt_inicio,
            },{
                where:{id:dados.id},
                transaction
            })
            await models.ConfigsInscricao.update({
                qtd_participantes_max:dados.inscricao.max_participantes,
                dt_fim:dados.inscricao.dt_fim,
                modo_inscricao:dados.inscricao.modo_inscricao
            },{
                where:{torneio_id:dados.id},transaction
            })

            await transaction.commit()
            return true;
        }catch(e){
            await transaction.rollback()
            throw e
        }
    }

}

export default new TorneioService()