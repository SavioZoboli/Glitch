import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from '../../config/database.config';

export interface EquipesAtributos {
    id:string,
    nome:string,
    dataCriacao?:Date,
}

export interface EquipesAtributosCriacao extends Optional<EquipesAtributos,'id'|'dataCriacao'>{};

export class Equipes extends Model<EquipesAtributos,EquipesAtributosCriacao>{}

Equipes.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false,
    },
    nome:{
        type:DataTypes.STRING(20),
        allowNull:false
    }
},{
    sequelize,
    tableName:'equipes',
    timestamps:true,
    underscored:true,
    createdAt:'dataCriacao',
    updatedAt:false,
})

export default Equipes;