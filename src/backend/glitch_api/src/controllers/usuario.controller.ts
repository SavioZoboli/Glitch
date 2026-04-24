import { Request, Response } from "express";

import usuarioService, { DadosUsuario } from "../services/usuario.service";
import criptoService from "../services/cripto.service";
import authService from "../services/auth.service";
import utilsService from "../services/utils.service";

// * Classe para lidar com as requisições de usuários
// * Métodos são executados pelo arquivo de rotas (usuario.route.ts)
class UsuarioController {

  // * Busca todos os usuários do sistema
  public async buscarTodos(req: Request, res: Response): Promise<any> {
    try {
      let dados = await usuarioService.buscarTodos();
      res.status(200).json(dados);
    } catch (error: any) {
      res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }

  public async buscarResumo(req: Request, res: Response): Promise<any> {
    let eu = req.usuario ? req.usuario.id : null
    try {
      let usuarios = await usuarioService.buscarResumido(eu);
      let resumo: any = []
      usuarios?.forEach((usuario: any) => {
        resumo.push({
          nickname: usuario.dataValues.nickname,
          dias_ativo: utilsService.dateDiff(new Date(usuario.dataValues.dt_criacao), new Date()),
          nacionalidade: usuario.dataValues.pessoa.nacionalidade,
          idade: utilsService.dateDiff(new Date(usuario.dataValues.pessoa.dt_nascimento), new Date(), 'anos'),
          email: usuario.dataValues.pessoa.email
        })
      })
      res.status(200).json(resumo)
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: "Erro interno do servidor" })
    }
  }

  // * Adiciona um usuário
  public async add(req: Request, res: Response): Promise<any> {
    let dados = req.body;
    try {
      if (
        dados.nome &&
        dados.sobrenome &&
        dados.nacionalidade &&
        dados.dt_nascimento &&
        dados.cpf &&
        dados.email &&
        dados.nickname &&
        dados.senha
      ) {
        let dadosForm: DadosUsuario = {
          nome: dados.nome,
          sobrenome: dados.sobrenome,
          email: dados.email,
          telefone: dados.telefone,
          nickname: dados.nickname,
          senha: await criptoService.hashPassword(dados.senha),
          cpf: dados.cpf,
          nacionalidade: dados.nacionalidade,
          dt_nascimento: new Date(dados.dt_nascimento)
        };
        await usuarioService.add(dadosForm);
        res.status(201).json({ message: "Criado" });
      } else {
        res.status(400).json({ message: "Formulário inválido" });
      }
    } catch (error: any) {
      console.log(error)
      // * Corrigido: comparação com error.message
      if (error.message === "ERR_NICKNAME_ALREADY_TAKEN") {
        res.status(400).json({ message: "Nickname indisponível" })
        return;
      }
      res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }

  public async login(req: Request, res: Response): Promise<any> {
    let dados = req.body;
    console.log(dados)
    try {
      if (dados.nickname && dados.senha) {
        let usuario = await usuarioService.login(dados);
        if (usuario) {
          const token = authService.geraToken(usuario)
          res.status(200).json(token);
        } else {
          res.status(401).json({ message: "Login ou senha inválidos" });
        }
      } else {
        res.status(400).json({ message: "Login e senha são obrigatórios" });
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }

  public async alteraSenha(req: Request, res: Response): Promise<any> {
    let dados = req.body;
    if (!dados.senha) {
      dados.senha = process.env.USER_DEFAULT_PASSWORD
    }
    if (dados.id) {
      try {
        dados.senha = await criptoService.hashPassword(dados.senha);
        if (await usuarioService.alteraSenha(dados.id, dados.senha)) {
          res.status(200).json({ message: "Senha alterada com sucesso" });
        } else {
          res.status(404).json({ message: "Usuário não encontrado" });
        }
      } catch (erro: any) {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    } else {
      res.status(400).json({ message: "Nome de usuário e nova senha requeridos" });
    }
  }

  public async buscaDadosUpdate(req: Request, res: Response): Promise<any> {
    if (req.usuario) {
      let dadosUsuario = await usuarioService.buscarPorId(req.usuario.id);
      if (dadosUsuario) {
        res.status(200).json(dadosUsuario)
      } else {
        res.status(404).json({ message: "Usuário não encontrado" })
      }
    } else {
      res.status(401).json({ message: "Não autorizado" })
    }
  }

  public async update(req: Request, res: Response): Promise<any> {
    let dados = req.body;
    console.log(dados.dt_nascimento)
    if (dados.id == req.usuario?.id) {
      if (dados.id && dados.nacionalidade && dados.email && dados.nickname) {
        try {
          let resposta = await usuarioService.update(dados);
          if (resposta) {
            res.status(200).json({ message: "Alterado com sucesso" });
          } else {
            res.status(404).json({ message: "Usuário não encontrado" });
          }
        } catch (error: any) {
          res.status(500).json({ message: "Erro interno do servidor" });
        }
      } else {
        res.status(400).json({ message: "É necessário enviar o ID para alteração" });
      }
    } else {
      res.status(401).json({ mensagem: "Usuário logado e a ser atualizado não são iguais" })
    }
  }

  public async deleteUsuario(req: Request, res: Response): Promise<any> {
    let id = req.usuario?.id
    if (id) {
      try {
        let resposta = await usuarioService.delete(id);
        if (resposta) {
          res.status(200).json({ message: "Removido" })
        } else {
          res.status(404).json({ message: "Usuário não encontrado" })
        }
      } catch (error: any) {
        res.status(500).json({ message: "Erro interno no servidor" })
      }
    } else {
      res.status(400).json({ message: "Necessário informar o ID" })
    }
  }

  public async meusDados(req: Request, res: Response) {
    if (req.usuario) {
      let dados = {
        nome: req.usuario.nome,
        nickname: req.usuario.nickname,
        email: req.usuario.email
      }
      res.status(200).json(dados)
      return;
    }
    res.status(500).json({ message: "Sem dados" })
  }

  // * Retorna todos os dados do painel do jogador em uma única requisição
  public async getDashboard(req: Request, res: Response): Promise<any> {
    if (!req.usuario) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    try {
      const dados = await usuarioService.getDadosDashboard(req.usuario.id);
      res.status(200).json(dados);
    } catch (error: any) {
      console.log(error);
      if (error.message === 'USUARIO_NAO_ENCONTRADO') {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }
}

export default new UsuarioController();