import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";

// * Define os atributos
export interface TipoUsuarioAtributos{
    id_tipo_usuario:string;
    descricao:string;
}

// * Define o que é opcional informar para criar a instânica
export interface TipoUsuarioAtributosCriacao extends Optional<TipoUsuarioAtributos,'id_tipo_usuario'>{}

// * Exporta a classe vazia, os atributos virão do extends
export class TipoUsuario extends Model<TipoUsuarioAtributos,TipoUsuarioAtributosCriacao>{
}
// * Inicializa o model com os campos configurados
TipoUsuario.init({
    id_tipo_usuario:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    descricao:{
        type:DataTypes.STRING(30),
        allowNull:false
    }
},{
    sequelize,
    tableName:"tb_tipo_usuario",
    modelName:"TipoUsuario",
    timestamps:false,
    underscored:true
})