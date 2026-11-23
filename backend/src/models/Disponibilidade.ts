import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export interface DisponibilidadeAttributes {
  id?: string
  barbeiroId: string
  inicio: Date
  fim: Date
}

export class Disponibilidade
  extends Model<DisponibilidadeAttributes>
  implements DisponibilidadeAttributes
{
  public id!: string
  public barbeiroId!: string
  public inicio!: Date
  public fim!: Date
}

Disponibilidade.init(
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
    inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fim: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        depoisDoInicio(this: Disponibilidade, valor: Date) {
          if (valor <= this.inicio) {
            throw new Error('O fim precisa ser posterior ao início.')
          }
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Disponibilidade',
    tableName: 'disponibilidades',
    underscored: true,
    timestamps: true,
  },
)
