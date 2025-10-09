import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import { CONNECTION_STRING } from '.'

async function main() {
	console.log('Attempting to connect to database...')

	try {
		const connectionConfig = {
			host: process.env.DB_HOST || 'localhost',
			port: Number.parseInt(process.env.DB_PORT || '5432', 10),
			database: process.env.POSTGRES_DB || 'app',
			user: process.env.POSTGRES_USER || 'postgres',
			password: process.env.POSTGRES_PASSWORD || 'postgres'
		}

		console.log('Connection config:', {
			...connectionConfig,
			password: '******'
		})

		// Create connection with more detailed options
		const client = postgres(CONNECTION_STRING, {
			max: 1,
			idle_timeout: 20,
			connect_timeout: 10
		})

		console.log('Running migrations...')
		await migrate(drizzle(client), {
			migrationsFolder: './src/db/migrations'
		})
		console.log('Migrations completed successfully')

		await client.end()
	} catch (err) {
		console.error('Migration failed:', err)
		process.exit(1)
	}
}

main().catch((err) => {
	console.error('Unhandled error during migration:', err)
	process.exit(1)
})
