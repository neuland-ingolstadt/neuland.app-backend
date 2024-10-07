import { getUserFromToken } from '@/utils/auth-utils'
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

const schema = readFileSync('./src/schema.gql', { encoding: 'utf-8' })
const typeDefs = schema
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
})

export const cache = new NodeCache({ stdTTL: 60 * 10 }) // 10 minutes default TTL

await apolloServer.start()

app.use('/', express.static(path.join(__dirname, 'documentation/generated')))
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

app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:' + port + '/graphql')
})
