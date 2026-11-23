import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { errorHandler } from './middlewares/errorhandler'
import { routes } from './routes'
import { swaggerDocument } from './docs/swagger'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.status(200).json({ mensagem: 'API da Barbearia funcionando!', status: 'online' })
})

app.get('/docs.json', (_req, res) => res.json(swaggerDocument))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'BarberFlow API — Swagger',
  explorer: true,
}))

app.use(routes)
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' })
})
app.use(errorHandler)
