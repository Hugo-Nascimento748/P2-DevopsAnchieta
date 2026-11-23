import { NextFunction, Request, Response } from 'express'
import { ExclusionConstraintError, ValidationError } from 'sequelize'
import { AppError } from '../utils/apperror'

export const MENSAGEM_HORARIO_INDISPONIVEL =
  'Horário indisponível: já existe outro agendamento nesse intervalo.'


export const ehConflitoDeHorario = (erro: unknown): boolean => {
  if (erro instanceof ExclusionConstraintError) return true
  const codigo = (erro as { parent?: { code?: string } })?.parent?.code
  return codigo === '23P01'
}

export const errorHandler = (
  erro: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (erro instanceof AppError) {
    res.status(erro.status).json({ erro: erro.message })
    return
  }

  if (ehConflitoDeHorario(erro)) {
    res.status(409).json({ erro: MENSAGEM_HORARIO_INDISPONIVEL })
    return
  }

  if (erro instanceof ValidationError) {
    res.status(400).json({ erro: erro.errors.map((e) => e.message).join(' | ') })
    return
  }

  console.error(erro)
  res.status(500).json({ erro: 'Erro interno do servidor.' })
}
