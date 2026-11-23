import { Router } from 'express'
import * as controller from '../controllers/servicoController'
import { asyncHandler } from '../utils/asyncHandler'

export const servicoRoutes = Router()

servicoRoutes.post('/', asyncHandler(controller.criar))
servicoRoutes.get('/', asyncHandler(controller.listar))
servicoRoutes.get('/:id', asyncHandler(controller.buscar))
servicoRoutes.put('/:id', asyncHandler(controller.atualizar))
servicoRoutes.delete('/:id', asyncHandler(controller.remover))
