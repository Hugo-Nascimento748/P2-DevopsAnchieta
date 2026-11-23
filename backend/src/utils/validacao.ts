import { AppError } from './AppError'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const exigirString = (valor: unknown, campo: string): string => {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new AppError(`O campo "${campo}" é obrigatório.`, 400)
  }
  return valor.trim()
}

export const exigirUuid = (valor: unknown, campo: string): string => {
  const texto = exigirString(valor, campo)
  if (!UUID_REGEX.test(texto)) {
    throw new AppError(`O campo "${campo}" deve ser um UUID válido.`, 400)
  }
  return texto
}

export const exigirData = (valor: unknown, campo: string): Date => {
  if (typeof valor !== 'string') {
    throw new AppError(`O campo "${campo}" é obrigatório (formato ISO 8601).`, 400)
  }
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) {
    throw new AppError(`O campo "${campo}" tem uma data inválida.`, 400)
  }
  return data
}

export const exigirNumero = (
  valor: unknown,
  campo: string,
  minimo: number,
): number => {
  const numero = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor
  if (typeof numero !== 'number' || !Number.isFinite(numero) || numero < minimo) {
    throw new AppError(`O campo "${campo}" deve ser um número maior ou igual a ${minimo}.`, 400)
  }
  return numero
}


export const queryString = (valor: unknown): string | undefined =>
  typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : undefined
