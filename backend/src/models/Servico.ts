
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export interface ServicoAttributes {
  id?: string
  barbeiroId: string
  nome: string
  descricao?: string | null
  duracaoMinutos: number
  preco: string | number
  ativo?: boolean
}

export class Servico
  extends Model<ServicoAttributes>
  implements ServicoAttributes
{
  public id!: string
  public barbeiroId!: string
  public nome!: string
  public descricao!: string | null
  public duracaoMinutos!: number

  // DECIMAL retorna string para preservar a precisão monetária.
  public preco!: string
  public ativo!: boolean
}

Servico.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    barbeiroId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'barbeiro_id',
    },
    nome: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duracaoMinutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duracao_minutos',
      validate: { min: 1 },
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Servico',
    tableName: 'servicos',
    underscored: true,
    timestamps: true,
  },
)
