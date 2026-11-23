import { Router } from 'express'
import { autenticar } from '../middlewares/authMiddleware'
import authRoutes from './authRoutes'
import { agendamentoRoutes } from './agendamentoRoutes'
import { barbeiroRoutes } from './barbeiroroutes'
import { disponibilidadeRoutes } from './disponibilidaderoutes'
import { servicoRoutes } from './servicoroutes'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/servicos', autenticar, servicoRoutes)
routes.use('/barbeiros', autenticar, barbeiroRoutes)
routes.use('/disponibilidades', autenticar, disponibilidadeRoutes)
routes.use('/agendamentos', autenticar, agendamentoRoutes)
