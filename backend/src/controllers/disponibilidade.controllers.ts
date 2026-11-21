import { Request, Response } from 'express'
import * as disponibilidadeService from '../services/disponibilidadeService'
import { exigirData, exigirUuid, queryString } from '../utils/validacao'

export const criar = async (req: Request, res: Response) => {
  
  const disponibilidade = await disponibilidadeService.criarDisponibilidade({
    barbeiroId: exigirUuid(req.body?.barbeiroId, 'barbeiroId'),
    inicio: exigirData(req.body?.inicio, 'inicio'),
    fim: exigirData(req.body?.fim, 'fim'),
  })
  res.status(201).json(disponibilidade)
}

export const listar = async (req: Request, res: Response) => {
  const barbeiroId = queryString(req.query.barbeiroId)
  const lista = await disponibilidadeService.listarDisponibilidades({
    barbeiroId: barbeiroId ? exigirUuid(barbeiroId, 'barbeiroId') : undefined,
    data: queryString(req.query.data),
  })
  res.json(lista)
}

export const remover = async (req: Request, res: Response) => {
  await disponibilidadeService.removerDisponibilidade(exigirUuid(req.params.id, 'id'))
  res.status(204).send()
}
