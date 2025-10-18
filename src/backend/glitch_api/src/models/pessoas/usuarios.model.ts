// src/models/pessoas/usuario.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';
import models from '../index.models';
import Pessoas from './pessoas.model';

// * Define os atributos
export interface UsuariosAtributos {
  id: string; // UUIDV4
  pessoa_id:string;
  nickname: string;
  senha: string; // Senha deve ser hashed em produção!
  ultima_altera_senha?:Date;
  ultimo_login?:Date;
  dt_criacao: Date;
}

// * Define o que é opcional informar para criar a instânica
export interface UsuariosAtributosCriacao extends Optional<UsuariosAtributos, 'id' | 'dt_criacao' |'ultima_altera_senha' | 'ultimo_login'> {}

// * Exporta a classe vazia, os atributos virão do extends
export class Usuarios extends Model<UsuariosAtributos, UsuariosAtributosCriacao>{

}

// * Inicializa o model com os campos configurados
Usuarios.init(
  {
    id: {
      type: DataTypes.UUID,               // * Hash aleatória de letras e números.
      defaultValue: DataTypes.UUIDV4,     // * Informa que o valor default é um UUID
      primaryKey: true,                   // * É chave primária
      allowNull: false,                   // * É not null
    },
    pessoa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {                     // * Vínculo com a tabela Pessoa
        model: Pessoas,
        key: 'id',
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    nickname: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique:true
    },
    senha: {
      type: DataTypes.STRING(200),        // * Tamanho maior para senhas hashed
      allowNull: false,
    },
    ultima_altera_senha: {
      type: DataTypes.DATE,
      allowNull: true,  
  },
    ultimo_login: {
      type: DataTypes.DATE,
      allowNull: true,
  },
  dt_criacao:{
    type: DataTypes.DATE,
      allowNull: false,
      defaultValue:new Date()
  }
},
  {
    sequelize,                        // * Conexão com o banco de dados
    tableName: 'usuarios',          // * Nome da tabela no banco de dados
    timestamps: false, 
    underscored: true,                // * Nome dos campos com underline (id_usuario)
    modelName: 'Usuario',             // * Nome da model para ser chamada em outras models
  }
);

export default Usuarios;