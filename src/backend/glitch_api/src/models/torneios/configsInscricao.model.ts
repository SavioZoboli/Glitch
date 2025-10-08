import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from '../../config/database.config'
import models from "../index.models";
import { Torneios } from "./torneios.model";

export interface ConfigsInscricaoAtributos {
    id:string;
    torneio_id:string;
    dt_inicio:Date;
    dt_fim:Date;
    qtd_participantes_max:number;
    modo_inscricao:string;
}

export interface ConfigsInscricaoAtributosCriacao extends Optional<ConfigsInscricaoAtributos,'id'>{}

export class ConfigsInscricao extends Model<ConfigsInscricaoAtributos,ConfigsInscricaoAtributosCriacao>{}

ConfigsInscricao.init({
    id:{
        type: DataTypes.UUID,
        allowNull:false,
        primaryKey: true,
        defaultValue:DataTypes.UUIDV4
    },
    torneio_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Torneios,
            key:'id'
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    dt_inicio:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    dt_fim:{
        type:DataTypes.DATE,
        allowNull:false
    },
    qtd_participantes_max:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    modo_inscricao:{
        type:DataTypes.STRING(10),
        allowNull:false,
        defaultValue:'INDIVIDUAL'
    }
},{
    sequelize,
    tableName:'configs_inscricao',
    underscored:true,
    timestamps:false
})

export default ConfigsInscricao;