import { sequelize } from "../config/database.config";
import models from "../models/index.models";

class UsuarioService {
    public async addEquipe(nome:string,lider:string):Promise<any>{
        let transaction = await sequelize.transaction()
        try{
            let equipe = await models.Equipes.create({
                nome:nome,dt_criacao:new Date()
            },{transaction})
            let membro = await models.MembrosEquipe.create({
                equipe_id:equipe.dataValues.id,
                usuario_id:lider,
                is_ativo:true,
                is_lider:true,
                is_titular:true,
                dt_convite:new Date(),
                dt_aceito:new Date()
            },{transaction})
            transaction.commit()
            return equipe;
        }catch(e){
            transaction.rollback()
            throw e;
        }
    }

    public async convidarJogador(equipe_id:string,nickname:string):Promise<any>{
        let transaction = await sequelize.transaction()
        try{
            let equipe = await models.Equipes.findByPk(equipe_id,{transaction})
            if(!equipe){
                return new Error('NOT_FOUND')
            }

            let jogador = await models.Usuarios.findOne({where:{nickname},transaction})

            if(!jogador){
                return new Error('NOT_FOUND')
            }

            let membro = await models.MembrosEquipe.create({
                equipe_id:equipe.dataValues.id,
                usuario_id:jogador.dataValues.id,
                is_ativo:true,
                is_lider:false,
                is_titular:false,
                dt_convite:new Date()
            },{transaction})
            transaction.commit()
            return true;
        }catch(e){
            transaction.rollback()
            return e
        }
    }

}

export default new UsuarioService();