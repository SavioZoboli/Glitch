// src/models/pessoas/pessoa.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

// * Define os atributos
export interface PessoasAtributos {
  id: string; // UUIDV4
  nome: string;
  sobrenome: string;
  is_ativo:boolean;
  nacionalidade:string;
  dt_nascimento:Date;
  cpf:string;
  email: string;
  telefone?: string; // Opcional no SQL
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// * Define o que é opcional informar para criar a instânica
export interface PessoasAtributosCriacao extends Optional<PessoasAtributos, 'id' | 'telefone' | 'dataCriacao' | 'dataAtualizacao'> {}

// * Exporta a classe vazia, os atributos virão do extends
export class Pessoas extends Model<PessoasAtributos, PessoasAtributosCriacao>{

}
// * Inicializa o model com os campos configurados
Pessoas.init(
  {
    id: {
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
    is_ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    nacionalidade: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    dt_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique:true,
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

export default Pessoas;