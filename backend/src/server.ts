import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { conectarBanco } from './config/database'
import './models'
import authRoutes from './routes/authRoutes'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.status(200).json({ mensagem: 'API da Barbearia funcionando!', status: 'online' })
})
app.use('/auth', authRoutes)

async function iniciarServidor(): Promise<void> {
  await conectarBanco()
  app.listen(port, () => console.log(`Servidor rodando na porta ${port}`))
}

iniciarServidor().catch((erro: unknown) => {
  console.error('Não foi possível iniciar a API.', erro)
  process.exit(1)
})
