import models from "../models/index.models";

export class JogoService{
    async getAllJogos():Promise<any>{
        try{
            let jogos = await models.Jogos.findAll({
                attributes:[['id','codigo'],'nome']
            });
            return jogos;
        }catch(e){
            return e;
        }
    }
}

export default new JogoService()