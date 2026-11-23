import { Request, Response } from 'express'
import * as servicoService from '../services/servicoservice'
import { AppError } from '../utils/apperror'
import {
  exigirNumero,
  exigirString,
  exigirUuid,
  queryString,
} from '../utils/validacao'

export const criar = async (req: Request, res: Response) => {
 
  const servico = await servicoService.criarServico({
    barbeiroId: exigirUuid(req.body?.barbeiroId, 'barbeiroId'),
    nome: exigirString(req.body?.nome, 'nome'),
    descricao: typeof req.body?.descricao === 'string' ? req.body.descricao : null,
    duracaoMinutos: exigirNumero(req.body?.duracaoMinutos, 'duracaoMinutos', 1),
    preco: exigirNumero(req.body?.preco, 'preco', 0),
  })
  res.status(201).json(servico)
}

export const listar = async (req: Request, res: Response) => {
  const barbeiroId = queryString(req.query.barbeiroId)
  const servicos = await servicoService.listarServicos({
    barbeiroId: barbeiroId ? exigirUuid(barbeiroId, 'barbeiroId') : undefined,
    incluirInativos: queryString(req.query.incluirInativos) === 'true',
  })
  res.json(servicos)
}

export const buscar = async (req: Request, res: Response) => {
  const id = exigirUuid(req.params.id, 'id')
  res.json(await servicoService.buscarServicoPorId(id))
}

export const atualizar = async (req: Request, res: Response) => {
  const id = exigirUuid(req.params.id, 'id')
  const corpo = req.body ?? {}
  const dados: servicoService.AtualizarServicoDados = {}

  if (corpo.nome !== undefined) dados.nome = exigirString(corpo.nome, 'nome')
  if (corpo.descricao !== undefined) {
    dados.descricao = typeof corpo.descricao === 'string' ? corpo.descricao : null
  }
  if (corpo.duracaoMinutos !== undefined) {
    dados.duracaoMinutos = exigirNumero(corpo.duracaoMinutos, 'duracaoMinutos', 1)
  }
  if (corpo.preco !== undefined) dados.preco = exigirNumero(corpo.preco, 'preco', 0)
  if (corpo.ativo !== undefined) {
    if (typeof corpo.ativo !== 'boolean') {
      throw new AppError('O campo "ativo" deve ser true ou false.', 400)
    }
    dados.ativo = corpo.ativo
  }

  if (Object.keys(dados).length === 0) {
    throw new AppError('Nenhum campo para atualizar foi enviado.', 400)
  }

  res.json(await servicoService.atualizarServico(id, dados))
}

export const remover = async (req: Request, res: Response) => {
  const id = exigirUuid(req.params.id, 'id')
  await servicoService.desativarServico(id)
  res.status(204).send()
}
