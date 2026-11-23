import { Op, WhereOptions } from 'sequelize'
import {
  Agendamento,
  Disponibilidade,
  Servico,
  StatusAgendamento,
  TipoUsuario,
  Usuario,
} from '../models'
import {
  ehConflitoDeHorario,
  MENSAGEM_HORARIO_INDISPONIVEL,
} from '../middlewares/errorhandler'
import { AppError } from '../utils/apperror'
import { fimDoDia, inicioDoDia, somarMinutos } from '../utils/datas'
import { garantirBarbeiro } from './barbeiroservice'


const sobrepoe = (inicio: Date, fim: Date) => ({
  inicio: { [Op.lt]: fim },
  fim: { [Op.gt]: inicio },
})

const naoCancelado = { [Op.ne]: StatusAgendamento.CANCELADO }

const buscarServicoDoBarbeiro = async (servicoId: string, barbeiroId: string) => {
  const servico = await Servico.findByPk(servicoId)

  if (!servico) {
    throw new AppError('Serviço não encontrado.', 404)
  }
  if (!servico.ativo) {
    throw new AppError('Esse serviço não está mais disponível.', 409)
  }
  if (servico.barbeiroId !== barbeiroId) {
    throw new AppError('Esse serviço não pertence ao barbeiro escolhido.', 400)
  }
  return servico
}

export const criarAgendamento = async (dados: {
  clienteId: string
  barbeiroId: string
  servicoId: string
  inicio: Date
}) => {
  const { clienteId, barbeiroId, servicoId, inicio } = dados

  if (inicio <= new Date()) {
    throw new AppError('Não é possível agendar em um horário que já passou.', 400)
  }

  const cliente = await Usuario.findOne({
    where: { id: clienteId, tipo: TipoUsuario.CLIENTE },
    attributes: ['id'],
  })
  if (!cliente) {
    throw new AppError('Cliente não encontrado.', 404)
  }

  await garantirBarbeiro(barbeiroId)
  const servico = await buscarServicoDoBarbeiro(servicoId, barbeiroId)

 
  const fim = somarMinutos(inicio, servico.duracaoMinutos)

  
  const disponibilidade = await Disponibilidade.findOne({
    where: {
      barbeiroId,
      inicio: { [Op.lte]: inicio },
      fim: { [Op.gte]: fim },
    },
  })
  if (!disponibilidade) {
    throw new AppError('O barbeiro não atende nesse horário.', 409)
  }

  
  const conflitoBarbeiro = await Agendamento.findOne({
    where: { barbeiroId, status: naoCancelado, ...sobrepoe(inicio, fim) },
  })
  if (conflitoBarbeiro) {
    throw new AppError(MENSAGEM_HORARIO_INDISPONIVEL, 409)
  }

  const conflitoCliente = await Agendamento.findOne({
    where: { clienteId, status: naoCancelado, ...sobrepoe(inicio, fim) },
  })
  if (conflitoCliente) {
    throw new AppError('Você já tem um agendamento nesse horário.', 409)
  }

  try {
    return await Agendamento.create({
      clienteId,
      barbeiroId,
      servicoId,
      inicio,
      fim,
    })
  } catch (erro) {
   
    if (ehConflitoDeHorario(erro)) {
      throw new AppError(MENSAGEM_HORARIO_INDISPONIVEL, 409)
    }
    throw erro
  }
}

export const listarAgendamentos = async (filtros: {
  barbeiroId?: string
  clienteId?: string
  data?: string
}) => {
  const where: WhereOptions = {}
  const condicoes: Record<string | symbol, unknown> = {}

  if (filtros.barbeiroId) condicoes.barbeiroId = filtros.barbeiroId
  if (filtros.clienteId) condicoes.clienteId = filtros.clienteId
  if (filtros.data) {
    Object.assign(condicoes, sobrepoe(inicioDoDia(filtros.data), fimDoDia(filtros.data)))
  }
  Object.assign(where, condicoes)

  return Agendamento.findAll({
    where,
    include: [
      { model: Servico, as: 'servico', attributes: ['id', 'nome', 'duracaoMinutos', 'preco'] },
      { model: Usuario, as: 'barbeiro', attributes: ['id', 'nome'] },
      { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'telefone'] },
    ],
    order: [['inicio', 'ASC']],
  })
}

export const cancelarAgendamento = async (id: string) => {
  const agendamento = await Agendamento.findByPk(id)
  if (!agendamento) {
    throw new AppError('Agendamento não encontrado.', 404)
  }
  if (agendamento.status === StatusAgendamento.CANCELADO) {
    throw new AppError('Esse agendamento já foi cancelado.', 409)
  }
  if (agendamento.status === StatusAgendamento.CONCLUIDO) {
    throw new AppError('Não é possível cancelar um agendamento concluído.', 409)
  }

  
  await agendamento.update({ status: StatusAgendamento.CANCELADO })
  return agendamento
}


export const listarHorariosLivres = async (dados: {
  barbeiroId: string
  servicoId: string
  data: string
}) => {
  const { barbeiroId, servicoId, data } = dados

  await garantirBarbeiro(barbeiroId)
  const servico = await buscarServicoDoBarbeiro(servicoId, barbeiroId)

  const diaInicio = inicioDoDia(data)
  const diaFim = fimDoDia(data)
  const agora = new Date()

  const [janelas, ocupados] = await Promise.all([
    Disponibilidade.findAll({
      where: { barbeiroId, ...sobrepoe(diaInicio, diaFim) },
      order: [['inicio', 'ASC']],
    }),
    Agendamento.findAll({
      where: { barbeiroId, status: naoCancelado, ...sobrepoe(diaInicio, diaFim) },
      attributes: ['inicio', 'fim'],
    }),
  ])

  const livres: { inicio: Date; fim: Date }[] = []

  for (const janela of janelas) {
    const limite = janela.fim < diaFim ? janela.fim : diaFim
    let cursor = janela.inicio > diaInicio ? janela.inicio : diaInicio
    if (cursor < agora) cursor = agora

    while (true) {
      const fim = somarMinutos(cursor, servico.duracaoMinutos)
      if (fim > limite) break

      const colide = ocupados.some((o) => cursor < o.fim && fim > o.inicio)
      if (!colide) livres.push({ inicio: cursor, fim })

      cursor = fim
    }
  }

  return livres
}
