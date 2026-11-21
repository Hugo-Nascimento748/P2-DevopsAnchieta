import { Request, Response } from 'express'
import * as agendamentoService from '../services/agendamentoService'
import { exigirData, exigirUuid, queryString } from '../utils/validacao'

export const criar = async (req: Request, res: Response) => {
  
  const agendamento = await agendamentoService.criarAgendamento({
    clienteId: exigirUuid(req.body?.clienteId, 'clienteId'),
    barbeiroId: exigirUuid(req.body?.barbeiroId, 'barbeiroId'),
    servicoId: exigirUuid(req.body?.servicoId, 'servicoId'),
    inicio: exigirData(req.body?.inicio, 'inicio'),
  })
  res.status(201).json(agendamento)
}

export const listar = async (req: Request, res: Response) => {
  const barbeiroId = queryString(req.query.barbeiroId)
  const clienteId = queryString(req.query.clienteId)

  const lista = await agendamentoService.listarAgendamentos({
    barbeiroId: barbeiroId ? exigirUuid(barbeiroId, 'barbeiroId') : undefined,
    clienteId: clienteId ? exigirUuid(clienteId, 'clienteId') : undefined,
    data: queryString(req.query.data),
  })
  res.json(lista)
}

export const cancelar = async (req: Request, res: Response) => {
  const agendamento = await agendamentoService.cancelarAgendamento(
    exigirUuid(req.params.id, 'id'),
  )
  res.json(agendamento)
}
