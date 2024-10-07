import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import schema from './schema'

export const CONNECTION_STRING = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.POSTGRES_DB}`

const queryClient = postgres(CONNECTION_STRING, { max: 1 })

export const db = drizzle(queryClient, { schema })
