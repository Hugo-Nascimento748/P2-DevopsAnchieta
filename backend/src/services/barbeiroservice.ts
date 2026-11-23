import { Servico, TipoUsuario, Usuario } from '../models'
import { AppError } from '../utils/AppError'

/** Lista pública de barbeiros (sem e-mail nem senha), com seus serviços ativos. */
export const listarBarbeiros = async () =>
  Usuario.findAll({
    where: { tipo: TipoUsuario.BARBEIRO },
    attributes: ['id', 'nome', 'telefone'],
    include: [
      {
        model: Servico,
        as: 'servicos',
        where: { ativo: true },
        required: false,
        attributes: ['id', 'nome', 'descricao', 'duracaoMinutos', 'preco'],
      },
    ],
    order: [['nome', 'ASC']],
  })

/** Garante que o id existe E pertence a um usuário do tipo BARBEIRO. */
export const buscarBarbeiroPorId = async (id: string) => {
  const barbeiro = await Usuario.findOne({
    where: { id, tipo: TipoUsuario.BARBEIRO },
    attributes: ['id', 'nome', 'telefone'],
    include: [
      {
        model: Servico,
        as: 'servicos',
        where: { ativo: true },
        required: false,
        attributes: ['id', 'nome', 'descricao', 'duracaoMinutos', 'preco'],
      },
    ],
  })

  if (!barbeiro) {
    throw new AppError('Barbeiro não encontrado.', 404)
  }
  return barbeiro
}

export const garantirBarbeiro = async (id: string): Promise<void> => {
  const existe = await Usuario.count({
    where: { id, tipo: TipoUsuario.BARBEIRO },
  })
  if (!existe) {
    throw new AppError('Barbeiro não encontrado.', 404)
  }
}
