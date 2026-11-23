import { Router } from 'express'
import { autenticar } from '../middlewares/authMiddleware'
import authRoutes from './authRoutes'
import { agendamentoRoutes } from './agendamentoRoutes'
import { barbeiroRoutes } from './barbeiroRoutes'
import { disponibilidadeRoutes } from './disponibilidadeRoutes'
import { servicoRoutes } from './servicoRoutes'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/servicos', autenticar, servicoRoutes)
routes.use('/barbeiros', autenticar, barbeiroRoutes)
routes.use('/disponibilidades', autenticar, disponibilidadeRoutes)
routes.use('/agendamentos', autenticar, agendamentoRoutes)
