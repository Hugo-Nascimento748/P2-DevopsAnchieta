import 'dotenv/config'
import { app } from './app'
import { conectarBanco } from './config/database'

const port = Number(process.env.PORT) || 3000

conectarBanco()
  .then(() => {
    app.listen(port, () => console.log(`Servidor rodando na porta ${port}.`))
  })
  .catch((erro: unknown) => {
    console.error('Falha ao iniciar:', erro)
    process.exit(1)
  })
