import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from '../../config/database.config'
import models from "../index.models";
import { Torneios } from "./torneios.model";

export interface EtapasPartidaAtributos{
    id:string;
    torneio_id:string;
    ordem:number;
    tipo_etapa:string;
    is_concluida:boolean
}

export interface EtapasPartidaAtributosCriacao extends Optional<EtapasPartidaAtributos,'id'>{}

export class EtapasPartida extends Model<EtapasPartidaAtributos,EtapasPartidaAtributosCriacao>{}

EtapasPartida.init({
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        allowNull:false,
        defaultValue:DataTypes.UUIDV4
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
    ordem:{
        type:DataTypes.SMALLINT,
        allowNull:false,
    },
    tipo_etapa:{
        type:DataTypes.STRING(20),
        allowNull:false
    },
    is_concluida:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
},{
    sequelize,
    tableName:'etapas_partida',
    underscored:true,
    timestamps:false
})

export default EtapasPartida;