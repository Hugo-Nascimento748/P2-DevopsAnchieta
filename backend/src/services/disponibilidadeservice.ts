import { Op } from 'sequelize'
import { Agendamento, Disponibilidade, StatusAgendamento } from '../models'
import { ehConflitoDeHorario } from '../middlewares/errorhandler'
import { AppError } from '../utils/apperror'
import { fimDoDia, inicioDoDia } from '../utils/datas'
import { garantirBarbeiro } from './barbeiroservice'

export const criarDisponibilidade = async (dados: {
  barbeiroId: string
  inicio: Date
  fim: Date
}) => {
  const { barbeiroId, inicio, fim } = dados

  if (fim <= inicio) {
    throw new AppError('O fim precisa ser posterior ao início.', 400)
  }
  if (inicio <= new Date()) {
    throw new AppError('Não é possível cadastrar disponibilidade no passado.', 400)
  }

  await garantirBarbeiro(barbeiroId)

  const sobreposta = await Disponibilidade.findOne({
    where: {
      barbeiroId,
      inicio: { [Op.lt]: fim },
      fim: { [Op.gt]: inicio },
    },
  })
  if (sobreposta) {
    throw new AppError(
      'Essa janela se sobrepõe a outra disponibilidade já cadastrada.',
      409,
    )
  }

  try {
    return await Disponibilidade.create({ barbeiroId, inicio, fim })
  } catch (erro) {
   
    if (ehConflitoDeHorario(erro)) {
      throw new AppError(
        'Essa janela se sobrepõe a outra disponibilidade já cadastrada.',
        409,
      )
    }
    throw erro
  }
}

export const listarDisponibilidades = async (filtros: {
  barbeiroId?: string
  data?: string
}) => {
  const where: Record<string | symbol, unknown> = {}
  if (filtros.barbeiroId) where.barbeiroId = filtros.barbeiroId
  if (filtros.data) {
    where.inicio = { [Op.lt]: fimDoDia(filtros.data) }
    where.fim = { [Op.gt]: inicioDoDia(filtros.data) }
  }

  return Disponibilidade.findAll({ where, order: [['inicio', 'ASC']] })
}

export const removerDisponibilidade = async (id: string): Promise<void> => {
  const disponibilidade = await Disponibilidade.findByPk(id)
  if (!disponibilidade) {
    throw new AppError('Disponibilidade não encontrada.', 404)
  }

  
  const agendamentosAtivos = await Agendamento.count({
    where: {
      barbeiroId: disponibilidade.barbeiroId,
      status: { [Op.ne]: StatusAgendamento.CANCELADO },
      inicio: { [Op.lt]: disponibilidade.fim },
      fim: { [Op.gt]: disponibilidade.inicio },
    },
  })
  if (agendamentosAtivos > 0) {
    throw new AppError(
      'Existem agendamentos nessa janela. Cancele-os antes de remover a disponibilidade.',
      409,
    )
  }

  await disponibilidade.destroy()
}
