import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from '../../config/database.config';
import models from "../index.models";
import { Torneios } from "./torneios.model";
import { Equipes, Usuarios } from "../pessoas/index.pessoas";

export interface ParticipantesAtributos{
    id:string;
    torneio_id:string;
    usuario_id?:string;
    equipe_id?:string;
    dt_inscricao:Date;
    dt_confirmacao:Date;
    status:string;
}

export interface ParticipantesAtributosCriacao extends Optional<ParticipantesAtributos,'id'|'usuario_id'|'equipe_id'>{}

export class Participantes extends Model<ParticipantesAtributos,ParticipantesAtributosCriacao>{}

Participantes.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    torneio_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Torneios,
            key:'id'
        },
        onDelete:'RESTRICT',
        onUpdate:'CASCADE'
    },
    usuario_id:{
        type:DataTypes.UUID,
        allowNull:true,
        references:{
            model:Usuarios,
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    equipe_id:{
        type:DataTypes.UUID,
        allowNull:true,
        references:{
            model:Equipes,
            key:'id'
        },
        onDelete:'RESTRICT',
        onUpdate:'CASCADE'
    },
    dt_inscricao:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:Date.now()
    },
    dt_confirmacao:{
        type:DataTypes.DATE,
        allowNull:true
    },
    status:{
        type:DataTypes.STRING(10),
        defaultValue:'PENDENTE',
        allowNull:false
    }
},{
    sequelize,
    tableName:'participantes',
    underscored:true,
    timestamps:false
})

export default Participantes;