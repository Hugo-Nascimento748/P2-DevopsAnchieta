import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { TipoUsuario } from '../models/Usuario'

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header('Authorization')
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) {
    res.status(401).json({ mensagem: 'Token não fornecido.' })
    return
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    res.status(500).json({ erro: 'JWT_SECRET não foi configurada.' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    if (
      typeof payload === 'string' ||
      typeof payload.id !== 'string' ||
      !Object.values(TipoUsuario).includes(payload.tipo as TipoUsuario)
    ) {
      res.status(401).json({ mensagem: 'Token inválido.' })
      return
    }
    res.locals.usuario = { id: payload.id, tipo: payload.tipo as TipoUsuario }
    next()
  } catch {
    res.status(401).json({ mensagem: 'Token inválido ou expirado.' })
  }
}
