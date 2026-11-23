import { Router } from 'express'
import * as controller from '../controllers/disponibilidadeController'
import { asyncHandler } from '../utils/asynchandler'

export const disponibilidadeRoutes = Router()

disponibilidadeRoutes.post('/', asyncHandler(controller.criar))
disponibilidadeRoutes.get('/', asyncHandler(controller.listar))
disponibilidadeRoutes.delete('/:id', asyncHandler(controller.remover))
