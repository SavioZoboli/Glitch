import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";

export interface JogosAtributos{
    id:string;
    nome:string;
    class_indicativa:string;
    estudio:string;
}

export interface JogosAtributosCriacao extends Optional<JogosAtributos,'id'>{}

export class Jogos extends Model<JogosAtributos,JogosAtributosCriacao>{}


Jogos.init({
    id:{
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,

    },
    nome:{
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    },
    class_indicativa:{
    type: DataTypes.STRING(3),
    allowNull: false,
},
    estudio:{
    type: DataTypes.STRING(20),
    allowNull: false,
    }
},{
    sequelize,
    tableName: 'jogos',
    timestamps: false,
    underscored:true
})