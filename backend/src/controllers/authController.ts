import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UniqueConstraintError } from 'sequelize'
import { TipoUsuario, Usuario } from '../models/Usuario'

function usuarioPublico(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    tipo: usuario.tipo,
  }
}

export async function cadastrar(req: Request, res: Response): Promise<void> {
  try {
    const { nome, email, senha, telefone, tipo } = req.body as Record<string, unknown>
    if (typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string') {
      res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' })
      return
    }

    const nomeNormalizado = nome.trim()
    const emailNormalizado = email.trim().toLowerCase()
    if (!nomeNormalizado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      res.status(400).json({ erro: 'Nome ou email inválido.' })
      return
    }
    if (senha.length < 8) {
      res.status(400).json({ erro: 'A senha deve ter pelo menos 8 caracteres.' })
      return
    }
    if (telefone !== undefined && telefone !== null && typeof telefone !== 'string') {
      res.status(400).json({ erro: 'Telefone inválido.' })
      return
    }

    const tipoUsuario = tipo ?? TipoUsuario.CLIENTE
    if (!Object.values(TipoUsuario).includes(tipoUsuario as TipoUsuario)) {
      res.status(400).json({ erro: 'Tipo de usuário inválido.' })
      return
    }

    const existente = await Usuario.findOne({ where: { email: emailNormalizado } })
    if (existente) {
      res.status(409).json({ erro: 'Este email já está cadastrado.' })
      return
    }

    const usuario = await Usuario.create({
      nome: nomeNormalizado,
      email: emailNormalizado,
      senhaHash: await bcrypt.hash(senha, 12),
      tipo: tipoUsuario as TipoUsuario,
      telefone: typeof telefone === 'string' && telefone.trim() ? telefone.trim() : null,
    })

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: usuarioPublico(usuario),
    })
  } catch (erro) {
    if (erro instanceof UniqueConstraintError) {
      res.status(409).json({ erro: 'Este email já está cadastrado.' })
      return
    }
    console.error(erro)
    res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, senha } = req.body as Record<string, unknown>
    if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
      res.status(400).json({ erro: 'Email e senha são obrigatórios.' })
      return
    }

    const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } })
    if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
      res.status(401).json({ erro: 'Email ou senha inválidos.' })
      return
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) throw new Error('JWT_SECRET não foi definida.')

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      jwtSecret,
      { expiresIn: '2h' },
    )

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: usuarioPublico(usuario),
    })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro interno ao realizar login.' })
  }
}
