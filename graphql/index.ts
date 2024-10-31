import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default'
import cors from 'cors'
import express from 'express'
import { readFileSync } from 'fs'
import type { JwtPayload } from 'jsonwebtoken'
import NodeCache from 'node-cache'
import path from 'path'

import { resolvers } from './src/resolvers'
import { getUserFromToken } from './src/utils/auth-utils'

const schemaFiles = [
    'enums.gql',
    'scalars.gql',
    'types.gql',
    'inputs.gql',
    'schema.gql',
]
const schemaDir = path.join(__dirname, 'src', 'schema')

const typeDefs = schemaFiles.map((file) => {
    const filePath = path.join(schemaDir, file)
    try {
        return readFileSync(filePath, { encoding: 'utf-8' })
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error)
        throw error
    }
})
const port = process.env.PORT || 4000

const app = express()
app.use(
    cors({
        origin: [
            'https://studio.apollographql.com',
            'http://localhost:3000',
            'https://dashboard.neuland.app',
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
    introspection: Bun.env.NODE_ENV !== 'production',
    formatError(formattedError, error) {
        console.error(error)
        return formattedError
    },
})

export const cache = new NodeCache({ stdTTL: 60 * 10 }) // 10 minutes default TTL

await apolloServer.start()

app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
        context: async ({ req }): Promise<{ jwtPayload?: JwtPayload }> => {
            const authHeader = req.headers.authorization
            if (authHeader) {
                return {
                    jwtPayload: await getUserFromToken(authHeader),
                }
            } else {
                return {}
            }
        },
    })
)

app.use(
    '/',
    express.static(path.join(__dirname, 'docs', 'out'), {
        extensions: ['html'],
    })
)

app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:' + port + '/graphql')
})
