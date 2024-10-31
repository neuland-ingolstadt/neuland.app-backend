import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import { CONNECTION_STRING } from '.'

async function main() {
    const client = postgres(CONNECTION_STRING, { max: 1 })
    await migrate(drizzle(client), { migrationsFolder: './src/db/migrations' })

    await client.end()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
