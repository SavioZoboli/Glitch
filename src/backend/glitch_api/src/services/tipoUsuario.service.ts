import  Models  from "../models/index.models";

class TipoUsuarioService{
    public async buscarTodos():Promise<any>{
        try{
            let tipos = await Models.TipoUsuario.findAll();
            return tipos;
        }catch(error:any){
            console.log(error);
        }
    }
}

export default new TipoUsuarioService();