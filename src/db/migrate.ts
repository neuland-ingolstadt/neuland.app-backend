// import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const client = postgres(
    `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    { max: 1 }
)
// This will run migrations on the database, skipping the ones already applied
await migrate(drizzle(client), { migrationsFolder: './drizzle' })

// Don't forget to close the connection, otherwise the script will hang
await client.end()
