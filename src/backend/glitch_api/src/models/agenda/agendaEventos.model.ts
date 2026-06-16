import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";

export interface AgendaEventosAtributos {
  id: string;
  origem_tipo: "TORNEIO" | "PARTIDA" | "CUSTOM";
  origem_id?: string | null;
  titulo_snapshot: string;
  descricao_snapshot?: string | null;
  inicio_snapshot: Date;
  fim_snapshot?: Date | null;
  status: "ATIVO" | "CONCLUIDO" | "CANCELADO";
  metadata?: Record<string, unknown> | null;
  is_ativo: boolean;
  dt_criacao: Date;
  dt_atualizacao: Date;
}

export interface AgendaEventosAtributosCriacao
  extends Optional<
    AgendaEventosAtributos,
    | "id"
    | "origem_id"
    | "descricao_snapshot"
    | "fim_snapshot"
    | "status"
    | "metadata"
    | "is_ativo"
    | "dt_criacao"
    | "dt_atualizacao"
  > {}

export class AgendaEventos extends Model<
  AgendaEventosAtributos,
  AgendaEventosAtributosCriacao
> {}

AgendaEventos.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    origem_tipo: {
      type: DataTypes.ENUM("TORNEIO", "PARTIDA", "CUSTOM"),
      allowNull: false,
    },
    origem_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    titulo_snapshot: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    descricao_snapshot: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    inicio_snapshot: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fim_snapshot: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ATIVO", "CONCLUIDO", "CANCELADO"),
      allowNull: false,
      defaultValue: "ATIVO",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    dt_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dt_atualizacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "agenda_eventos",
    timestamps: false,
    underscored: true,
  },
);

export default AgendaEventos;
