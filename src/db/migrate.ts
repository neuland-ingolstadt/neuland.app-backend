import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function main() {
    const client = postgres(
        `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        { max: 1 }
    )
    await migrate(drizzle(client), { migrationsFolder: './drizzle' })

    await client.end()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
