import tipoUsuarioService from "../services/tipoUsuario.service";
import {Request,Response} from 'express'

// * Classe para tratar dos tipos de usuário
// * Métodos são chamados pelo arquivo de rotas (tipo.route.ts)
class TipoUsuarioController {

  // * Função de buscar os usuários, lista todos os usuários do banco.

  public async buscarTodos(req: Request, res: Response): Promise<any> {
    try {
      let tipos = await tipoUsuarioService.buscarTodos();
      res.status(200).json(tipos)
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar" });
    }
  }
}

export default new TipoUsuarioController();
