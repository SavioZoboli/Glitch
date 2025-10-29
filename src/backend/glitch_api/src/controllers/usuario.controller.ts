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

  public async buscarResumo(req: Request, res: Response): Promise<any>{
    let eu = req.usuario?req.usuario.id:null
    try{
      let usuarios = await usuarioService.buscarResumido(eu);
      let resumo:any = []
      usuarios?.forEach((usuario:any)=>{
        resumo.push({
          nickname:usuario.dataValues.nickname,
          dias_ativo:utilsService.dateDiff(new Date(usuario.dataValues.dt_criacao),new Date()),
          nacionalidade:usuario.dataValues.pessoa.nacionalidade,
          idade:utilsService.dateDiff(new Date(usuario.dataValues.pessoa.dt_nascimento),new Date(),'anos'),
          email:usuario.dataValues.pessoa.email
        })
      })
      res.status(200).json(resumo)
    }catch(e){
      console.log(e)
      res.status(500).json({message:"Erro interno do servidor"})
    }
  }

  // * Adiciona um usuário
  public async add(req: Request, res: Response): Promise<any> {

    // * Recebe dados do body da requisição HTTP
    let dados = req.body;

    // * Tenta adicionar
    try {
      // * Verifica se possui os dados obrigatórios
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
        // * Formata os dados de inclusão
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
        // * Chama a função de inclusão
        await usuarioService.add(dadosForm);
        res.status(201).json({ message: "Criado" });
      } else {
        // ! Dados obrigatórios faltando
        res.status(400).json({ message: "Formulário inválido" });
      }
    } catch (error: any) {
      console.log(error)
      // ! Erro durante a execução
      if (error == "ERR_NICKNAME_ALREADY_TAKEN") {
        res.status(400).json({ message: "Nickname indisponível", error })
        return;
      }
      res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }

  // * Tenta fazer o login do usuário
  // ? Mudar para um controller auth.controller.ts?
  public async login(req: Request, res: Response): Promise<any> {
    // * Recebe os dados do body
    let dados = req.body;
    console.log(dados)
    try {
      if (dados.nickname && dados.senha) { // * Verifica se o usuário e senha foram informados
        let usuario = await usuarioService.login(dados); // * Retorna o usuário com essas informações
        if (usuario) {
          // * Se achar, gera tokens de acesso e refresh

          /*
          
          ! Em fase de implementação
          
          Tokens são bons para fazer a autenticação do usuário nas requisições.
          A cada login do usuário geramos um token novo para que ele possa usar.
          
          Ao todo são 2 tokens gerados, o token de acesso e o token de recarga.
          O token de acesso será o que será validado para fazer o uso do sistema, ele expirará mais rápido (1h)
          O token de recarga será utilizado apenas quando o token de acesso expirar, ele demora mais para expirar (7 dias).
          Haverá uma rota que o frontend usará para solicitar um novo token utilizando o token de recarga.

          Caso o token de recarga esteja expirado também, o usuário será deslogado do sistema e precisará se 
          autenticar de novo.
          
          */

          //   let accessToken = authService.geraToken({
          //   id: usuario.id,
          //   email: usuario.email,
          //   tipo:usuario.tipo
          // },'1h');

          // let refreshToken = authService.geraToken({
          //   id: usuario.id,
          //   email: usuario.email,
          //   tipo:usuario.tipo
          // },'7d');

          // * Envia os dados por meio de Cookies HTTPOnly, que não são mostrados no navegador
          // res.cookie('accessToken',accessToken,{httpOnly:true,secure:false,sameSite:'strict'})
          // res.cookie('refreshToken',refreshToken,{httpOnly:true,secure:false,sameSite:'strict'})
          const token = authService.geraToken(usuario)
          res.status(200).json(token);
        } else {
          // ! Usuário não encontrado, então login ou senha inválido
          res.status(401).json({ message: "Login ou senha inválidos" });
        }
      } else {
        // ! Sistema não recebeu login e senha
        res.status(400).json({ message: "Login e senha são obrigatórios" });
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }

  // * Função para alterar a senha
  public async alteraSenha(req: Request, res: Response): Promise<any> {
    let dados = req.body;
    // * Se não tiver senha no body, quer dizer que vai resetar a senha
    if (!dados.senha) {
      // * Atribui a senha padrão do sistema, informada no .env
      dados.senha = process.env.USER_DEFAULT_PASSWORD
    }

    // * Se recebeu o id do usuário, vai tentar alterar a senha
    if (dados.id) {
      try {
        // * Faz um hash da senha usando bcrypt
        dados.senha = await criptoService.hashPassword(dados.senha);
        // * Altera a senha
        if (await usuarioService.alteraSenha(dados.id, dados.senha)) {
          res.status(200).json({ message: "Senha alterada com sucesso" });
        } else {
          // ! Não achou o usuário
          res.status(404).json({ message: "Usuário não encontrado" });
        }
      } catch (erro: any) {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    } else {
      res
        .status(400)
        .json({ message: "Nome de usuário e nova senha requeridos" });
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

  // * Altera os dados do usuário 
  public async update(req: Request, res: Response): Promise<any> {
    // * Pega os dados do body
    let dados = req.body;

    console.log(dados.dt_nascimento)

    if (dados.id == req.usuario?.id) {
      // * Se houve dados recebidos
      if (dados.id &&
        dados.nacionalidade &&
        dados.email &&
        dados.nickname
      ) {
        try {
          // * Altera os dados
          let resposta = await usuarioService.update(dados);
          if (resposta) {
            res.status(200).json({ message: "Alterado com sucesso" });
          } else {
            // ! Usuário não encontrado
            res.status(404).json({ message: "Usuário não encontrado" });
          }
        } catch (error: any) {
          res.status(500).json({ message: "Erro interno do servidor" });
        }
      } else {
        // ! Dados não recebidos
        res
          .status(400)
          .json({ message: "É necessário enviar o ID para alteração" });
      }
    }else{
      res.status(401).json({mensagem:"Usuário logado e a ser atualizado não são iguais"})
    }
  }

  // * Função para excluir o usuário
  public async deleteUsuario(req: Request, res: Response): Promise<any> {
    // * Recebe o ID por parâmetro
    let id = req.usuario?.id
    if (id) {
      try {
        // * Remove o usuaário
        let resposta = await usuarioService.delete(id);
        if (resposta) {
          res.status(200).json({ message: "Removido" })
        } else {
          // ! Usuário não encontrado
          res.status(404).json({ message: "Usuário não encontrado" })
        }
      } catch (error: any) {
        res.status(500).json({ message: "Erro interno no servidor" })
      }
    } else {
      // ! ID não informado
      res.status(400).json({ message: "Necessário informar o ID" })
    }
  }

  // * Função para buscar os dados do usuário logado
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

}



// * Exporta uma instância da classe para ser usada na rota.
export default new UsuarioController();
