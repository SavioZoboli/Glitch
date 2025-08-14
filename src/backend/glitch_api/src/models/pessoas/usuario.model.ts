// src/models/pessoas/usuario.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';
import { Pessoa as PessoaModel } from './pessoa.model';
import { TipoUsuario as TipoUsuarioModel } from './tipo-usuario.model'

// * Define os atributos
export interface UsuarioAtributos {
  id_usuario: string; // UUIDV4
  login: string;
  senha: string; // Senha deve ser hashed em produção!
  fk_id_pessoa: string; // UUID
  fk_id_tipo_usuario: string; // UUID
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// * Define o que é opcional informar para criar a instânica
export interface UsuarioAtributosCriacao extends Optional<UsuarioAtributos, 'id_usuario' | 'dataCriacao' | 'dataAtualizacao'> {}

// * Exporta a classe vazia, os atributos virão do extends
export class Usuario extends Model<UsuarioAtributos, UsuarioAtributosCriacao>{

}

// * Inicializa o model com os campos configurados
Usuario.init(
  {
    id_usuario: {
      type: DataTypes.UUID,               // * Hash aleatória de letras e números.
      defaultValue: DataTypes.UUIDV4,     // * Informa que o valor default é um UUID
      primaryKey: true,                   // * É chave primária
      allowNull: false,                   // * É not null
    },
    login: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    senha: {
      type: DataTypes.STRING(200),        // * Tamanho maior para senhas hashed
      allowNull: false,
    },
    fk_id_pessoa: {
      type: DataTypes.UUID,               // * Como o ID da pessoa é um UUID, a FK precisa ser UUID também
      allowNull: false,
      references: {                       // * Adiciona a restrição de vínculo com a tabela Pessoa
        model: PessoaModel,
        key: 'id_pessoa',
      },
      onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    fk_id_tipo_usuario: {                  
      type: DataTypes.UUID,             // ? Mudar para INTEGER para economizar espaço?
      allowNull: false,
      references: {                     // * Vínculo com a tabela TipoUsuario
        model: TipoUsuarioModel,
        key: 'id_tipo_usuario',
      },
      onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
  },
  {
    sequelize,                        // * Conexão com o banco de dados
    tableName: 'tb_usuario',          // * Nome da tabela no banco de dados
    timestamps: false,                // ? Permitir timestamp para saber quando o usuário foi criado e modificado?
    underscored: true,                // * Nome dos campos com underline (id_usuario)
    modelName: 'Usuario',             // * Nome da model para ser chamada em outras models
  }
);

export default Usuario;