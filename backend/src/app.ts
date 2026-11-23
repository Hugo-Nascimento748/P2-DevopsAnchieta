import cors from 'cors'
import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import { routes } from './routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.status(200).json({ mensagem: 'API da Barbearia funcionando!', status: 'online' })
})

app.use(routes)
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' })
})
app.use(errorHandler)
