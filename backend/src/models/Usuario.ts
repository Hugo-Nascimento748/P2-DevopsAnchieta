import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export enum TipoUsuario {
  CLIENTE = 'CLIENTE',
  BARBEIRO = 'BARBEIRO',
}

export interface UsuarioAttributes {
  id?: string
  nome: string
  email: string
  senhaHash: string
  tipo: TipoUsuario
  telefone?: string | null
}

export class Usuario
  extends Model<UsuarioAttributes>
  implements UsuarioAttributes
{
  public id!: string
  public nome!: string
  public email!: string
  public senhaHash!: string
  public tipo!: TipoUsuario
  public telefone!: string | null
}

Usuario.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    senhaHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'senha_hash',
    },
    tipo: {
      type: DataTypes.ENUM(...Object.values(TipoUsuario)),
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    underscored: true,
    timestamps: true,
  },
)
