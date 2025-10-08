import { sequelize } from "../config/database.config";
import Usuario from "../models/pessoas/usuarios.model";
import criptoService from "./cripto.service";
import Models from "../models/index.models";
import authService from "./auth.service";

// * Tipagem para os dados de inclusão
export type DadosInclusaoUsuario = {
  id?:string;
  nome: string;
  sobrenome: string;
  login: string;
  senha: string;
  email: string;
  telefone: string;
  tipo_usuario: string;
};

// * Classe com os métodos da service
class UsuarioService {
  // Função assíncrona de buscar todos
  public async buscarTodos(): Promise<Usuario[] | null> {
    try {
      // * Executa a função findAll da model.
      let usuarios = await Models.Usuarios.findAll({
        attributes: ["id_usuario","login"], // Filtra apenas os dados importantes
        include: [
          {                                 // Junta com a tabela Pessoa e busca os dados do campo attributes
            model: Models.Pessoas,
            as: "pessoa",
            attributes: ["nome", "sobrenome", "email", "telefone"],
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
  public async add(dados: DadosInclusaoUsuario): Promise<boolean | null> {
    // * abre uma transação pois serão feitas várias consultas e gravações no banco
    const transaction = await sequelize.transaction();
    try {
      // * conta se o tipo de usuário que veio do formulário existe no banco

      // * Cria a pessoa
      // let pessoa = await Models.Pessoas.create(
      //   {
      //     nome: dados.nome,
      //     sobrenome: dados.sobrenome,
      //     email: dados.email,
      //     telefone: dados.telefone,
      //     nacionalidade:dados.nacionalidade,

      //   },
      //   { transaction } // ! importante a transaction aqui
      // );

      // if (pessoa) { // Se a pessoa foi adicionada e o tipo é válido
      //   // Cria o usuário
      //   let usuario = await Models.Usuarios.create(
      //     {
      //       login: dados.login,
      //       senha: await criptoService.hashPassword(dados.senha),
      //       fk_id_pessoa: pessoa.dataValues.id_pessoa,
      //       fk_id_tipo_usuario: dados.tipo_usuario,
      //     },
      //     { transaction } // ! Importante a transaction aqui
      //   );
      //   transaction.commit(); // * Se não aconteceu nenhum erro, ele chega aqui e confirma as informações
      //   return true;
      // } else {
      //   transaction.rollback(); // * Desfaz as alterações em caso de erro
      //   return false;
      // }
      return false;
    } catch (error: any) {
      throw error;
    }
  }

  // Tentativa de login
  // ? Mudar para o auth.service?
  public async login(dados: {login: string;senha: string;}): Promise<any| null> {
    try {
      // // Verifica se há um usuário com esse login
      // let usuario: any = await Models.Usuario.findOne({
      //   where: {
      //     login: dados.login,
      //   },
      //   attributes: ["id_usuario", "senha"], // Filtra apenas id e senha
      //   include: [
      //     { model: Models.Pessoa, as: "pessoa", attributes: ["email","nome","sobrenome"] }, // tras o email, nome e sobrenome para gerar o token
      //     {model:Models.TipoUsuario,as:'tipoUsuario',attributes:['descricao']} // tras o tipo também para retornar para o front end
      //   ],
      // });
      // if (
      //   usuario &&
      //   usuario.dataValues.id_usuario &&
      //   usuario.dataValues.pessoa &&
      //   usuario.dataValues.pessoa.email &&
      //   usuario.dataValues.tipoUsuario.descricao
      // ) { // Verifica se os dados todos foram retornados

      //   // * Valida a senha
      //   if (!await criptoService.verifyPassword(dados.senha,usuario.dataValues.senha)) {
      //       // ! Senha inválida
      //       return null;
      //   }

      //   // * Organiza os dados para retornar
      //   let usuarioData = {
      //     id:usuario.dataValues.id_usuario,
      //     nome:usuario.dataValues.pessoa.nome+' '+usuario.dataValues.pessoa.sobrenome,
      //     email:usuario.dataValues.pessoa.email,
      //     tipo:usuario.dataValues.tipoUsuario.descricao
      //   }
      //   // * retorna os dados do usuário
      //   return usuarioData;
      // } else {
      //   // ! Usuário não encontrado
      //   return null;
      // }
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
  public async update(dados:DadosInclusaoUsuario):Promise<boolean|null>{
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

}

// Export ao serviço para ser usado no controller
export default new UsuarioService();
