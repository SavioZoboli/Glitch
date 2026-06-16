import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database.config";
import { Usuarios } from "../pessoas/index.pessoas";
import { AgendaEventos } from "./agendaEventos.model";

export interface AgendaUsuariosAtributos {
  id: string;
  usuario_id: string;
  evento_id: string;
  papel: "ORGANIZADOR" | "INSCRITO" | "ESPECTADOR";
  fonte: "AUTO" | "MANUAL";
  is_ativo: boolean;
  dt_adicionado: Date;
  dt_removido?: Date | null;
}

export interface AgendaUsuariosAtributosCriacao
  extends Optional<
    AgendaUsuariosAtributos,
    "id" | "fonte" | "is_ativo" | "dt_adicionado" | "dt_removido"
  > {}

export class AgendaUsuarios extends Model<
  AgendaUsuariosAtributos,
  AgendaUsuariosAtributosCriacao
> {}

AgendaUsuarios.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
    papel: {
      type: DataTypes.ENUM("ORGANIZADOR", "INSCRITO", "ESPECTADOR"),
      allowNull: false,
    },
    fonte: {
      type: DataTypes.ENUM("AUTO", "MANUAL"),
      allowNull: false,
      defaultValue: "AUTO",
    },
    is_ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    dt_adicionado: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dt_removido: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "agenda_usuarios",
    timestamps: false,
    underscored: true,
  },
);

export default AgendaUsuarios;
