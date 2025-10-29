import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from '../../config/database.config';
import models from "../index.models";
import Equipes from "./equipes.model";
import { Usuarios } from "./index.pessoas";

export interface MembrosEquipeAtributos{
    equipe_id:string;
    usuario_id:string;
    funcao:string;
    is_lider:boolean;
    is_titular:boolean;
    is_ativo:boolean;
    dt_convite:Date;
    dt_aceito?:Date;
    dt_saida?:Date;
}

export interface MembrosEquipeAtributosCriacao extends Optional<MembrosEquipeAtributos,'funcao'|'dt_aceito'|'dt_saida'>{};

export class MembrosEquipe extends Model<MembrosEquipeAtributos,MembrosEquipeAtributosCriacao>{};

MembrosEquipe.init({
    equipe_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Equipes,
            key:'id'
        },
        onDelete:'RESTRICT',
        onUpdate:'CASCADE'
    },
    usuario_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Usuarios,
            key:'id'
        },
        onDelete:'RESTRICT',
        onUpdate:'CASCADE'
    },
    funcao:{
        type:DataTypes.STRING(20),
        allowNull:true,
    },
    is_lider:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false,
    },
    is_titular:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true,
    },
    is_ativo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true,
    },
    dt_convite:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:DataTypes.NOW,
    },
    dt_aceito:{
        type:DataTypes.DATE,
        allowNull:true,
    },
    dt_saida:{
        type:DataTypes.DATE,
        allowNull:true,
    }
},{
    sequelize,
    tableName:'membros_equipe',
    timestamps:false,
    underscored:true,
})

export default MembrosEquipe;