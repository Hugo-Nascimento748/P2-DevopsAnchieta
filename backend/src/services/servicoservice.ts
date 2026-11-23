import { Servico } from '../models'
import { AppError } from '../utils/AppError'
import { garantirBarbeiro } from './barbeiroService'

export interface CriarServicoDados {
  barbeiroId: string
  nome: string
  descricao?: string | null
  duracaoMinutos: number
  preco: number
}

export interface AtualizarServicoDados {
  nome?: string
  descricao?: string | null
  duracaoMinutos?: number
  preco?: number
  ativo?: boolean
}

export const criarServico = async (dados: CriarServicoDados) => {
  await garantirBarbeiro(dados.barbeiroId)

  return Servico.create({
    barbeiroId: dados.barbeiroId,
    nome: dados.nome,
    descricao: dados.descricao ?? null,
    duracaoMinutos: dados.duracaoMinutos,
    preco: dados.preco,
  })
}

export const listarServicos = async (filtros: {
  barbeiroId?: string
  incluirInativos?: boolean
}) => {
  const where: { barbeiroId?: string; ativo?: boolean } = {}
  if (filtros.barbeiroId) where.barbeiroId = filtros.barbeiroId
  if (!filtros.incluirInativos) where.ativo = true

  return Servico.findAll({ where, order: [['nome', 'ASC']] })
}

export const buscarServicoPorId = async (id: string) => {
  const servico = await Servico.findByPk(id)
  if (!servico) {
    throw new AppError('Serviço não encontrado.', 404)
  }
  return servico
}


export const atualizarServico = async (id: string, dados: AtualizarServicoDados) => {
  const servico = await buscarServicoPorId(id)
  await servico.update(dados)
  return servico
}


export const desativarServico = async (id: string) => {
  const servico = await buscarServicoPorId(id)
  await servico.update({ ativo: false })
  return servico
}
