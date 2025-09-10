import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from '../../config/database.config';

export interface PartidasAtributos{
    id:string;
    etapa_id:string;
    dt_inicio:Date;
    dt_fim?:Date;
    situacao:string;
}

export interface PartidasAtributosCriacao extends Optional<PartidasAtributos,'id'|'dt_fim'>{}

export class Partidas extends Model<PartidasAtributos,PartidasAtributosCriacao>{}

Partidas.init({
    id:{
        type:DataTypes.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    etapa_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:'etapasPartida',
            key:'id'
        },
        onDelete:'RESTRICT',
        onUpdate:'CASCADE'
    },
    dt_inicio:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    dt_fim:{
        type:DataTypes.DATE,
        allowNull:true
    },
    situacao:{
        type:DataTypes.STRING(15),
        allowNull:false,
        defaultValue:'NÃO INICIADO'
    }
},{
    sequelize,
    tableName:'partidas',
    underscored:true,
    timestamps:false
})

export default Partidas;