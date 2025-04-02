import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema/',
    out: './src/db/migrations',
    dbCredentials: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.POSTGRES_DB || 'app',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        user: process.env.POSTGRES_USER || 'postgres',
    },
})
