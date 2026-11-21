import { Request, Response } from 'express'
import * as agendamentoService from '../services/agendamentoService'
import * as barbeiroService from '../services/barbeiroService'
import { exigirString, exigirUuid } from '../utils/validacao'

export const listar = async (_req: Request, res: Response) => {
  res.json(await barbeiroService.listarBarbeiros())
}

export const buscar = async (req: Request, res: Response) => {
  const id = exigirUuid(req.params.id, 'id')
  res.json(await barbeiroService.buscarBarbeiroPorId(id))
}

/
export const horariosLivres = async (req: Request, res: Response) => {
  const horarios = await agendamentoService.listarHorariosLivres({
    barbeiroId: exigirUuid(req.params.id, 'id'),
    servicoId: exigirUuid(req.query.servicoId, 'servicoId'),
    data: exigirString(req.query.data, 'data'),
  })
  res.json(horarios)
}
