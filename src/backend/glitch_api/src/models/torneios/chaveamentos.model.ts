import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";
import models from "../index.models";
import Partidas from "./partidas.model";
import Participantes from "./participantes.model";

export interface ChaveamentosAtributos {
    id: string;
    participante_a_id: string;
    participante_b_id: string;
    vencedor_id: string;
    partida_id: string;
    ordem: number;
    placar_a: number;
    placar_b: number;
    criterio_desempate: string;
    is_a_pronto: boolean;
    is_b_pronto: boolean;
}

export interface ChaveamentosAtributosCriacao extends Optional<ChaveamentosAtributos, 'id' | 'vencedor_id' | 'placar_a' | 'placar_b' | 'criterio_desempate'> { }

export class Chaveamentos extends Model<ChaveamentosAtributos, ChaveamentosAtributosCriacao> { }

Chaveamentos.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    participante_a_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Participantes,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    participante_b_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Participantes,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    vencedor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Participantes,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    partida_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Partidas,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    ordem: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    placar_a: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    placar_b: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    criterio_desempate: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_a_pronto: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_b_pronto: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'chaveamentos',
    tableName: 'chaveamentos',
    underscored: true,
    timestamps: false
})

export default Chaveamentos;