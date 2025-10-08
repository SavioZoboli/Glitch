import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";
import models from "../index.models";
import Partidas from "./partidas.model";
import { Usuarios } from "../pessoas/index.pessoas";

export interface LogsPartidaAtributos{
    id:string;
    usuario_origem_id:string;
    usuario_destino_id:string;
    partida_id:string;
    acao:string;
    motivo:string;
    dt_log:Date
}

export interface LogsPartidaAtributosCriacao extends Optional<LogsPartidaAtributos,'id'|'motivo'>{}

export class LogsPartida extends Model<LogsPartidaAtributos,LogsPartidaAtributosCriacao>{}

LogsPartida.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false
    },
    usuario_origem_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Usuarios,
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    usuario_destino_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Usuarios,
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    partida_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Partidas,
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    acao:{
        type:DataTypes.STRING(20),
        allowNull:false
    },
    motivo:{
        type:DataTypes.STRING(20),
        allowNull:true
    },
    dt_log:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:new Date()
    }
},{
    sequelize,
    modelName:'logsPartida',
    tableName:'logsPartida',
    timestamps:false,
    underscored:true
})

export default LogsPartida;