
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export enum StatusAgendamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO',
}

export interface AgendamentoAttributes {
  id?: string
  clienteId: string
  barbeiroId: string
  servicoId: string
  inicio: Date
  fim: Date
  status?: StatusAgendamento
}

export class Agendamento
  extends Model<AgendamentoAttributes>
  implements AgendamentoAttributes
{
  public id!: string
  public clienteId!: string
  public barbeiroId!: string
  public servicoId!: string
  public inicio!: Date
  public fim!: Date
  public status!: StatusAgendamento
}

Agendamento.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'cliente_id',
    },
    barbeiroId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'barbeiro_id',
    },
    servicoId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'servico_id',
    },
    inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fim: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        depoisDoInicio(this: Agendamento, valor: Date) {
          if (valor <= this.inicio) {
            throw new Error('O fim precisa ser posterior ao início.')
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StatusAgendamento)),
      allowNull: false,
      defaultValue: StatusAgendamento.PENDENTE,
    },
  },
  {
    sequelize,
    modelName: 'Agendamento',
    tableName: 'agendamentos',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['barbeiro_id', 'inicio'] },
      { fields: ['cliente_id', 'inicio'] },
    ],
  },
)
