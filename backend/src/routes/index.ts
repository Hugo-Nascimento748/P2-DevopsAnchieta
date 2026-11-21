import { Router } from 'express'
import { agendamentoRoutes } from './agendamentoRoutes'
import { barbeiroRoutes } from './barbeiroRoutes'
import { disponibilidadeRoutes } from './disponibilidadeRoutes'
import { servicoRoutes } from './servicoRoutes'

export const routes = Router()

routes.use('/servicos', servicoRoutes)
routes.use('/barbeiros', barbeiroRoutes)
routes.use('/disponibilidades', disponibilidadeRoutes)
routes.use('/agendamentos', agendamentoRoutes)
