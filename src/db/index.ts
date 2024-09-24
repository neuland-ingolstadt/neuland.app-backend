import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import schema from './schema'

const queryClient = postgres(
    `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    { max: 1 }
)

export const db = drizzle(queryClient, { schema })
