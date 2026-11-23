
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

const garantirRestricoesDeHorario = async (): Promise<void> => {
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist')

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_sem_conflito'
      ) THEN
        ALTER TABLE agendamentos
        ADD CONSTRAINT agendamentos_sem_conflito
        EXCLUDE USING gist (
          barbeiro_id WITH =,
          tstzrange(inicio, fim, '[)') WITH &&
        )
        WHERE (status <> 'CANCELADO');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'disponibilidades_sem_sobreposicao'
      ) THEN
        ALTER TABLE disponibilidades
        ADD CONSTRAINT disponibilidades_sem_sobreposicao
        EXCLUDE USING gist (
          barbeiro_id WITH =,
          tstzrange(inicio, fim, '[)') WITH &&
        );
      END IF;
    END $$;
  `)
}

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate()

  await import('../models')

  await sequelize.sync()
  await garantirRestricoesDeHorario()

  console.log('Banco de dados conectado.')
}
