import {  DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config"; 
import models from "../index.models";
import { Usuarios } from "../pessoas/index.pessoas";
import { Jogos } from "./jogos.model";

export interface TorneiosAtributos {
    id: string;
    jogo_id: string;
    usuario_responsavel_id: string;
    nome: string;
    descricao?: string;
    dt_inicio: Date;
    dt_fim?: Date|null;
    tipo_realizacao?: "Online" | "Presencial" | null;
    endereco_rua?: string | null;
    endereco_numero?: string | null;
    endereco_bairro?: string | null;
    endereco_cidade?: string | null;
    endereco_estado?: string | null;
    endereco_cep?: string | null;
    qtd_participantes_min?: number | null;
    qtd_participantes_max?: number | null;
    dt_limite_ingresso?: Date | null;
    aceita_ingresso?: boolean | null;
    tipo_inscricao?: "Individual" | "Grupo" | null;
    qtd_grupos?: number | null;
    valor_ingresso?: number | null;
    valor_premiacao?: number | null;
    plataforma_coleta?: string | null;
    plataforma_streaming?: string | null;
}

export interface TorneiosAtributosCriacao extends Optional<
  TorneiosAtributos,
  | "id"
  | "descricao"
  | "dt_fim"
  | "tipo_realizacao"
  | "endereco_rua"
  | "endereco_numero"
  | "endereco_bairro"
  | "endereco_cidade"
  | "endereco_estado"
  | "endereco_cep"
  | "qtd_participantes_min"
  | "qtd_participantes_max"
  | "dt_limite_ingresso"
  | "aceita_ingresso"
  | "tipo_inscricao"
  | "qtd_grupos"
  | "valor_ingresso"
  | "valor_premiacao"
  | "plataforma_coleta"
  | "plataforma_streaming"
> { }

export class Torneios extends Model<TorneiosAtributos,TorneiosAtributosCriacao>{}

Torneios.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    jogo_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model:Jogos,
            key: 'id',
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    usuario_responsavel_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model:Usuarios,
            key: 'id',
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    nome:{
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    descricao:{
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    dt_inicio:{
        type: DataTypes.DATE,
        allowNull: false,
    },
    dt_fim:{
        type: DataTypes.DATE,
        allowNull: true,    
    },
    tipo_realizacao: {
        type: DataTypes.ENUM("Online", "Presencial"),
        allowNull: true,
    },
    endereco_rua: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    endereco_numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    endereco_bairro: {
        type: DataTypes.STRING(80),
        allowNull: true,
    },
    endereco_cidade: {
        type: DataTypes.STRING(80),
        allowNull: true,
    },
    endereco_estado: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    endereco_cep: {
        type: DataTypes.STRING(9),
        allowNull: true,
    },
    qtd_participantes_min: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    qtd_participantes_max: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    dt_limite_ingresso: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    aceita_ingresso: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    tipo_inscricao: {
        type: DataTypes.ENUM("Individual", "Grupo"),
        allowNull: true,
    },
    qtd_grupos: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    valor_ingresso: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    valor_premiacao: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    plataforma_coleta: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    plataforma_streaming: {
        type: DataTypes.STRING(120),
        allowNull: true,
    }
},{
    sequelize,
    tableName: 'torneios',
    timestamps: false,
    underscored:true,
    
})
    
