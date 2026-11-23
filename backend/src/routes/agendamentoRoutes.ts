import { Router } from 'express'
import * as controller from '../controllers/agendamentoController'
import { asyncHandler } from '../utils/asynchandler'

export const agendamentoRoutes = Router()

agendamentoRoutes.post('/', asyncHandler(controller.criar))
agendamentoRoutes.get('/', asyncHandler(controller.listar))
agendamentoRoutes.patch('/:id/cancelar', asyncHandler(controller.cancelar))
