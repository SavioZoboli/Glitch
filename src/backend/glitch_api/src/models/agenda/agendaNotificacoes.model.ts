import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";
import { Usuarios } from "../pessoas/index.pessoas";
import { AgendaEventos } from "./agendaEventos.model";

export interface AgendaNotificacoesAtributos {
  id: string;
  usuario_id: string;
  evento_id: string;
  tipo_alerta: "DIA_09H" | "ANTES_5MIN";
  titulo: string;
  mensagem: string;
  referencia_data: string;
  dt_evento: Date;
  is_lida: boolean;
  dt_lida?: Date | null;
  dt_criacao: Date;
}

export interface AgendaNotificacoesAtributosCriacao
  extends Optional<
    AgendaNotificacoesAtributos,
    "id" | "is_lida" | "dt_lida" | "dt_criacao"
  > {}

export class AgendaNotificacoes extends Model<
  AgendaNotificacoesAtributos,
  AgendaNotificacoesAtributosCriacao
> {}

AgendaNotificacoes.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    evento_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: AgendaEventos,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    tipo_alerta: {
      type: DataTypes.ENUM("DIA_09H", "ANTES_5MIN"),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    mensagem: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    referencia_data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dt_evento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_lida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    dt_lida: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dt_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "agenda_notificacoes",
    timestamps: false,
    underscored: true,
  },
);

export default AgendaNotificacoes;
