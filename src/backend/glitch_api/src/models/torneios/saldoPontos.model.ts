import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";

export interface SaldoPontosAtributos{
    id:string;
    usuario_id:string;
    jogo_id:string;
    pontos:number;
}

export interface SaldoPontosAtributosCriacao extends Optional<SaldoPontosAtributos,'id'>{}

export class SaldoPontos extends Model<SaldoPontosAtributos,SaldoPontosAtributosCriacao>{}

SaldoPontos.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    usuario_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:'usuarios',
            key:'id'
        },
        onDelete:'RESTRICT',
        onUpdate:'CASCADE'
    },
    jogo_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:'jogos',
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    pontos:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0,
    }
},{
    sequelize,
    tableName:'saldoPontos',
    modelName:'saldoPontos',
    underscored:true,
    timestamps:false,
})

export default SaldoPontos;