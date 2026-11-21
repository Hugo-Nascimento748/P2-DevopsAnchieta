import { Router } from 'express'
import * as controller from '../controllers/barbeiroController'
import { asyncHandler } from '../utils/asyncHandler'

export const barbeiroRoutes = Router()

barbeiroRoutes.get('/', asyncHandler(controller.listar))
barbeiroRoutes.get('/:id', asyncHandler(controller.buscar))
barbeiroRoutes.get('/:id/horarios-livres', asyncHandler(controller.horariosLivres))
