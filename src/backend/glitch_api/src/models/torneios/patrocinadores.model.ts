import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";

export interface PatrocinadoresAtributos{
    id:string;
    torneio_id:string;
    nome:string;
    link_patrocinio?:string;
    valor:number;
    is_principal:boolean;
}

export interface PatrocinadoresAtributosCriacao extends Optional<PatrocinadoresAtributos,'id'|'link_patrocinio'>{}

export class Patrocinadores extends Model<PatrocinadoresAtributos,PatrocinadoresAtributosCriacao>{}

Patrocinadores.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false
    },
    torneio_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:'torneios',
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    nome:{
        type:DataTypes.STRING(40),
        allowNull:false
    },
    link_patrocinio:{
        type:DataTypes.STRING(100),
        allowNull:true
    },
    valor:{
        type:DataTypes.DECIMAL(15,2),
        allowNull:false
    },
    is_principal:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
},{
    sequelize,
    tableName:'patrocinadores',
    underscored:true,
    timestamps:false
})

export default Patrocinadores;