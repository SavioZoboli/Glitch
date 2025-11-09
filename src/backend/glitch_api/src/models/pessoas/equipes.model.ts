import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from '../../config/database.config';

export interface EquipesAtributos {
    id:string,
    nome:string,
    dt_criacao:Date,
    is_ativo:boolean
}

export interface EquipesAtributosCriacao extends Optional<EquipesAtributos,'id'|'is_ativo'>{};

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
    },
    dt_criacao:{
        type:DataTypes.DATE,
        allowNull:false
    },
    is_ativo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
},{
    sequelize,
    tableName:'equipes',
    underscored:true,
    timestamps:false
})

export default Equipes;