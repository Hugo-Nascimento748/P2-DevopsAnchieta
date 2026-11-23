import 'dotenv/config'
import { Sequelize } from 'sequelize'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL não foi definida.')
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
})

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate()
  await sequelize.sync()
  console.log('Banco de dados conectado.')
}
