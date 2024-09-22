import { getAuthRole } from '@/utils/auth-utils'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default'
import cors from 'cors'
import express from 'express'
import { readFileSync } from 'fs'
import knex from 'knex'
import NodeCache from 'node-cache'
import path from 'path'

import { resolvers } from './src/resolvers'

const typeDefs = readFileSync('./src/schema.gql', { encoding: 'utf-8' })

const app = express()
app.use(
    cors({
        origin: [
            'https://studio.apollographql.com',
            'http://localhost:3000',
            'https://dev.neuland.app',
            'https://neuland.app',
        ],
    })
)

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,

    plugins: [
        Bun.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageProductionDefault({
                  footer: false,
              })
            : ApolloServerPluginLandingPageLocalDefault(),
    ],
})

export const cache = new NodeCache({ stdTTL: 60 * 10 }) // 10 minutes default TTL

const connection = {
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
}

export const db = knex({
    client: 'pg',
    connection,
})

await apolloServer.start()

app.use('/', express.static(path.join(__dirname, 'documentation/generated')))

app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
        context: async ({ req }): Promise<{ authRole: string }> => {
            return {
                authRole: getAuthRole(req.headers.authorization || ''),
            }
        },
    })
)

app.listen(4000, () => {
    console.log('🚀 Server ready at http://localhost:4000/graphql')
})
