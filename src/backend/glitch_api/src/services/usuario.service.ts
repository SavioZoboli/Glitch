import { sequelize } from "../config/database.config";
import Usuario, { Usuarios } from "../models/pessoas/usuarios.model";
import criptoService from "./cripto.service";
import Models from "../models/index.models";
import authService from "./auth.service";

// * Tipagem para os dados de inclusão
export type DadosUsuario = {
  id?:string;
  nome: string;
  sobrenome: string;
  nacionalidade:string;
  dt_nascimento:Date;
  cpf:string;
  nickname: string;
  senha: string;
  email: string;
  telefone: string;
};

// * Classe com os métodos da service
class UsuarioService {
  // Função assíncrona de buscar todos
  public async buscarTodos(): Promise<Usuario[] | null> {
    try {
      // * Executa a função findAll da model.
      let usuarios = await Models.Usuarios.findAll({
        attributes: ["id","nickname"], // Filtra apenas os dados importantes
        include: [
          {                                 // Junta com a tabela Pessoa e busca os dados do campo attributes
            model: Models.Pessoas,
            as: "pessoa",
            attributes: ["nome", "sobrenome","nacionalidade", "email", "telefone"],
          }
        ],
      });
      return usuarios; // Retorna os usuários
    } catch (error: any) {
      // ! Repassa o erro para frente
      throw error;
    }
  }

  // * função de adição do usuário
  public async add(dados: DadosUsuario): Promise<boolean | null> {
    // * abre uma transação pois serão feitas várias consultas e gravações no banco
    const transaction = await sequelize.transaction();
    try {
      // * conta se o tipo de usuário que veio do formulário existe no banco

      // * Cria a pessoa
      let pessoa = await Models.Pessoas.create(
        {
          nome: dados.nome,
          sobrenome: dados.sobrenome,
          nacionalidade:dados.nacionalidade,
          email: dados.email,
          telefone: dados.telefone,
          dt_nascimento:dados.dt_nascimento,
          cpf:dados.cpf,

        },
        { transaction } // ! importante a transaction aqui
      );

      if (pessoa) { // Se a pessoa foi adicionada e o tipo é válido
        // Cria o usuário
        let usuario = await Models.Usuarios.create(
          {
            nickname: dados.nickname,
            senha: dados.senha,
            pessoa_id: pessoa.dataValues.id,
          },
          { transaction } // ! Importante a transaction aqui
        );
        transaction.commit(); // * Se não aconteceu nenhum erro, ele chega aqui e confirma as informações
        return true;
      } else {
        transaction.rollback(); // * Desfaz as alterações em caso de erro
        return false;
      }
    } catch (error: any) {
      if(error.name == 'SequelizeUniqueConstraintError'){
        throw new Error("ERR_NICKNAME_ALREADY_TAKEN")
      }
      throw error;
    }
  }

  // Tentativa de login
  // ? Mudar para o auth.service?
  public async login(dados: {nickname: string;senha: string;}): Promise<any| null> {
    try {
      // Verifica se há um usuário com esse login
      let usuario: any = await Models.Usuarios.findOne({
        where: {
          nickname: dados.nickname,
        },
        attributes: ["id","nickname", "senha"], // Filtra apenas id e senha
        include: [
          { model: Models.Pessoas, as: "pessoa", attributes: ["email","nome","sobrenome"] }, // tras o email, nome e sobrenome para gerar o token
        ],
      });
      if (
        usuario && usuario.dataValues.id
      ) { // Verifica se os dados todos foram retornados

        // * Valida a senha
        if (!await criptoService.verifyPassword(dados.senha,usuario.dataValues.senha)) {
            // ! Senha inválida
            return null;
        }

        // * Organiza os dados para retornar
        let usuarioData = {
          id:usuario.dataValues.id,
          nome:usuario.dataValues.pessoa.nome+' '+usuario.dataValues.pessoa.sobrenome,
          nickname:usuario.dataValues.nickname,
          email:usuario.dataValues.pessoa.email
        }
        // * retorna os dados do usuário
        return usuarioData;
      } else {
        // ! Usuário não encontrado
        return null;
      }
    } catch (error: any) {
      throw error;
    }
  }

  // * Função para aletar a senha
  public async alteraSenha(id:string,senha:string):Promise<boolean>{
    try{
      // // * Busca o usuário
      //   let usuario = await Models.Usuario.findByPk(id);
      //   if(usuario){
      //     // Se encontrou o usuário, altera a senha
      //       await usuario.update({senha:senha})
      //       // Conseguiu alterar
      //       return true;
      //   }
      //   // Não encontrou o usuário
        return false;
    }catch(erro:any){
        throw erro;
    }
  }

  // * função para alterar o usuário
  public async update(dados:DadosUsuario):Promise<boolean|null>{
    // Inicia uma transaction pois fará várias coisas no banco
    const transaction = await sequelize.transaction();
    try{
      // // * Busca o usuaŕio
      // let usuario = await Models.Usuario.findByPk(dados.id,{transaction});
      // // * Busca a pessoa
      // let pessoa = await Models.Pessoa.findByPk(usuario?.dataValues.fk_id_pessoa,{transaction});
      // if(usuario && pessoa){
      //   // * Se usuário e pessoa foram encontrados
      //   await usuario.update({ // no usuário pode alterar o nome de usuário e o tipo
      //     login:dados.login,
      //     fk_id_tipo_usuario:dados.tipo_usuario
      //   },{transaction})

      //   await pessoa.update({ // na pessoa pode alterar nome, sobrenome, email e telefone
      //     nome:dados.nome,
      //     sobrenome:dados.sobrenome,
      //     email:dados.email,
      //     telefone:dados.telefone
      //   },{transaction})
      //   // Se chegou até aqui, faz o commit
      //   transaction.commit()
      //   return true;
      // }
      // // Se não achou usuário ou pessoa, faz o rollback
      // transaction.rollback()
      return false;
    }catch(error:any){
      // Se deu um erro faz o rollback
      transaction.rollback()
      throw error;
    }
  }

  // Função para remover um usuário
  public async delete(id:string):Promise<boolean>{
    // Inicia uma transaction
    let transaction = await sequelize.transaction()
    try{
      // // Busca usuário e pessoa
      // let usuario = await Models.Usuario.findByPk(id,{transaction});
      // let pessoa = await Models.Pessoa.findByPk(usuario?.dataValues.fk_id_pessoa,{transaction})
      // if(usuario && pessoa){
      //   // Usa a função destroy para remover usuário e pessoa
      //   await usuario.destroy({transaction})
      //   await pessoa.destroy({transaction})
      //   // se chegou até aqui faz o commit
      //   transaction.commit()
      //   return true;
      // }else{
      //   // Se não achou, faz o rollback
      //   transaction.rollback()
      //   return false;
      // }
      return false;
    }catch(erro:any){
      // Se deu erro, faz o rollback
      transaction.rollback()
      throw erro;
    }
  }

  // Busca por ID
  public async buscarPorId(id:string):Promise<boolean|Usuarios|null>{
    if(!id){
      return false;
    }
    try{
      let usuario = Models.Usuarios.findByPk(id,{
        include:{
          model:Models.Pessoas,
          as:'pessoas'
        }
      })
      return usuario;      
    }catch(e){
      return false;
    }
  }

}

// Export ao serviço para ser usado no controller
export default new UsuarioService();
