import {  DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config"; 

export interface TorneiosAtributos {
    id: string;
    jogo_id: string;
    usuario_responsavel_id: string;
    nome: string;
    descricao: string;
    dt_inicio: Date;
    dt_fim: Date;
}

export interface TorneiosAtributosCriacao extends Optional<TorneiosAtributos, 'id' | 'dt_fim'> { }

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
            model:'jogos',
            key: 'id',
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    usuario_responsavel_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model:'usuarios',
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
        allowNull: false,
    },
    dt_inicio:{
        type: DataTypes.DATE,
        allowNull: false,
    },
    dt_fim:{
        type: DataTypes.DATE,
        allowNull: true,    
    }
},{
    sequelize,
    tableName: 'torneios',
    timestamps: false,
    underscored:true,
    
})
    