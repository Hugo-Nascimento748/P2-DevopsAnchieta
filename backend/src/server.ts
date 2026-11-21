import 'dotenv/config'
import { app } from './app'
import { connectDatabase } from './config/database'

const PORT = Number(process.env.PORT) || 3000

connectDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}.`))
  })
  .catch((erro) => {
    console.error('Falha ao iniciar:', erro)
    process.exit(1)
  })
