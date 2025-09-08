import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";

export interface MensagensAtributos{
    id:string;
    usuario_origem_id:string;
    usuario_destino_id:string;
    mensagem:string;
    is_alerta:boolean;
    dt_enviado:Date;
    dt_lido?:Date;
}

export interface MensagensCriacaoAtributos extends Optional<MensagensAtributos,'id'|'dt_lido'>{}

export class Mensagens extends Model<MensagensAtributos,MensagensCriacaoAtributos>{}

Mensagens.init({
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4,
        allowNull:false,

    },
    usuario_origem_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:'usuarios',
            key:'id',
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    usuario_destino_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:'usuarios',
            key:'id',
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
    },
    mensagem:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    is_alerta:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false,
    },
    dt_enviado:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:DataTypes.NOW,
    },
    dt_lido:{
        type:DataTypes.DATE,
        allowNull:true,
    }
},{
    sequelize,
    tableName:'mensagens',
    timestamps:false,
    modelName:'Mensagens',
    underscored:true,
})

export default Mensagens;
