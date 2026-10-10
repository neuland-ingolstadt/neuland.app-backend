import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { logger } from '@/utils/logger'
import { CONNECTION_STRING } from '.'

async function main() {
    logger.info('Attempting to connect to database...')

    try {
        const connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: Number.parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.POSTGRES_DB || 'app',
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'postgres'
        }

        logger.info('Database connection config', {
            ...connectionConfig,
            password: '******'
        })

        // Create connection with more detailed options
        const client = postgres(CONNECTION_STRING, {
            max: 1,
            idle_timeout: 20,
            connect_timeout: 10
        })

        logger.info('Running migrations...')
        await migrate(drizzle(client), {
            migrationsFolder: './src/db/migrations'
        })
        logger.info('Migrations completed successfully')

        await client.end()
    } catch (err) {
        logger.error('Migration failed', { err })
        process.exit(1)
    }
}

main().catch((err) => {
    logger.error('Unhandled error during migration', { err })
    process.exit(1)
})
