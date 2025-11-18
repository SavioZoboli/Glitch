import { sequelize } from "../config/database.config";
import models from "../models/index.models";

export class TorneioService{

    async addTorneio(dados:any):Promise<any>{
        let transaction = await sequelize.transaction();
        try{

            let usuario = await models.Usuarios.findOne({where:{nickname:dados.usuario_responsavel},transaction})
            if(!usuario){
                return 404;
            }
            let torneio = await models.Torneios.create({
                jogo_id:dados.jogo_id,
                usuario_responsavel_id:usuario.dataValues.id,
                nome:dados.nome,
                descricao:dados.descricao,
                dt_inicio:dados.dt_inicio
            },{transaction})
            if(torneio){
                let configInscricao = await models.ConfigsInscricao.create({
                    torneio_id:torneio.dataValues.id,
                    dt_inicio:new Date(),
                    dt_fim:dados.inscricao.dt_fim,
                    qtd_participantes_max:dados.inscricao.max_participantes,
                    modo_inscricao:dados.inscricao.modo_inscricao
                },{transaction})
                if(configInscricao){
                    await transaction.commit()
                    return 200
                }
                transaction.rollback()
                return 500
            }
            transaction.rollback()
            return 500
        }catch(e){
            transaction.rollback()
            console.error(e)
            throw e;
        }
    }

    async getAllTorneios():Promise<any>{
        try{
            let torneios = await models.Torneios.findAll({
                attributes:[['id','codigo'],'nome','descricao','dt_inicio','dt_fim'],
                include:[{
                    model:models.Jogos,
                    as:'jogos',
                    attributes:['nome','class_indicativa']
                },{
                    model:models.Usuarios,
                    as:'usuarios',
                    attributes:[['nickname','organizador']]
                }]
            })
            return torneios;
        }catch(e){
            return e;
        }
    }

}

export default new TorneioService()