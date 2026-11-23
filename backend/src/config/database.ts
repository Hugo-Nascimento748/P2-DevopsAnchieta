import 'dotenv/config'
import { Sequelize } from 'sequelize'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL não foi definida.')

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

export async function conectarBanco(): Promise<void> {
  await sequelize.authenticate()
  await sequelize.sync()
  console.log('Conexão com o banco de dados estabelecida.')
}
