// src/models/pessoas/pessoa.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

// * Define os atributos
export interface PessoaAtributos {
  id_pessoa: string; // UUIDV4
  nome: string;
  sobrenome: string;
  email: string;
  telefone?: string; // Opcional no SQL
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// * Define o que é opcional informar para criar a instânica
export interface PessoaAtributosCriacao extends Optional<PessoaAtributos, 'id_pessoa' | 'telefone' | 'dataCriacao' | 'dataAtualizacao'> {}

// * Exporta a classe vazia, os atributos virão do extends
export class Pessoa extends Model<PessoaAtributos, PessoaAtributosCriacao>{

}
// * Inicializa o model com os campos configurados
Pessoa.init(
  {
    id_pessoa: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    sobrenome: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING(12),
      allowNull: true, // Telefone é opcional
    },
  },
  {
    sequelize,
    tableName: 'tb_pessoa',
    timestamps: false,
    underscored: true,
    modelName: 'Pessoa',
  }
);

export default Pessoa;