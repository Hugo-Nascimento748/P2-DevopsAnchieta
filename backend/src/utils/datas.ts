import { AppError } from './apperror'


const OFFSET_BRASIL = '-03:00'

export const somarMinutos = (data: Date, minutos: number): Date =>
  new Date(data.getTime() + minutos * 60_000)


export const inicioDoDia = (data: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new AppError('Data inválida. Use o formato AAAA-MM-DD.', 400)
  }
  const resultado = new Date(`${data}T00:00:00${OFFSET_BRASIL}`)
  if (Number.isNaN(resultado.getTime())) {
    throw new AppError('Data inválida. Use o formato AAAA-MM-DD.', 400)
  }
  return resultado
}

export const fimDoDia = (data: string): Date =>
  somarMinutos(inicioDoDia(data), 24 * 60)
