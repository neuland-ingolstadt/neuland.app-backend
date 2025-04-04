import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import schema from './schema'

export const CONNECTION_STRING = `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.POSTGRES_DB || 'app'}`

const queryClient = postgres(CONNECTION_STRING, { max: 1 })

export const db = drizzle(queryClient, { schema })
