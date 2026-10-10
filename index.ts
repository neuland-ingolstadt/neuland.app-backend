import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ApolloServer } from '@apollo/server'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault
} from '@apollo/server/plugin/landingPage/default'
import { expressMiddleware } from '@as-integrations/express5'
import cors from 'cors'
import express from 'express'
import type { JwtPayload } from 'jsonwebtoken'
import NodeCache from 'node-cache'
import { getUserFromToken } from '@/utils/auth-utils'
import { logger } from '@/utils/logger'

import { resolvers } from './src/resolvers'

const schemaFiles = [
    'enums.gql',
    'scalars.gql',
    'types.gql',
    'inputs.gql',
    'schema.gql'
]
const schemaDir = path.join(__dirname, 'src', 'schema')

const typeDefs = schemaFiles.map((file) => {
    const filePath = path.join(schemaDir, file)
    try {
        return readFileSync(filePath, { encoding: 'utf-8' })
    } catch (error) {
        logger.error('Failed to read GraphQL schema file', {
            file: filePath,
            err: error
        })
        throw error
    }
})
const port = process.env.PORT || 4000

const app = express()
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:8081',
            'https://dashboard.neuland.app',
            'https://dev.neuland.app',
            'https://web.neuland.app',
            /^https:\/\/[\w.-]+\.expo\.app$/
        ]
    })
)

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        Bun.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageProductionDefault({
                  footer: false
              })
            : ApolloServerPluginLandingPageLocalDefault(),
        {
            async requestDidStart(requestContext) {
                const start = Date.now()
                const operationName =
                    requestContext.request.operationName ?? 'anonymous'
                return {
                    async willSendResponse(context) {
                        const durationMs = Date.now() - start
                        const errors = context.response.body
                            ? 'errors' in context.response.body &&
                              Array.isArray(context.response.body.errors)
                                ? context.response.body.errors.map(
                                      (e) => e.message
                                  )
                                : []
                            : []
                        if (errors.length > 0) {
                            logger.warn(
                                'GraphQL operation completed with errors',
                                {
                                    operationName,
                                    durationMs,
                                    errors
                                }
                            )
                        } else {
                            logger.debug('GraphQL operation completed', {
                                operationName,
                                durationMs
                            })
                        }
                    },
                    async didEncounterErrors(context) {
                        for (const err of context.errors) {
                            logger.error('GraphQL operation error', {
                                operationName,
                                err
                            })
                        }
                    }
                }
            }
        }
    ],
    introspection: true,
    formatError(formattedError, error) {
        logger.error('GraphQL formatted error', { err: error })
        return formattedError
    }
})

export const cache = new NodeCache({
    stdTTL: 60 * 10,
    maxKeys: 1000,
    checkperiod: 60,
    useClones: false,
    deleteOnExpire: true
})
await apolloServer.start()

app.use((req, res, next) => {
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID()
    res.setHeader('x-request-id', requestId)
    const start = Date.now()
    const path = req.originalUrl.split('?')[0]
    res.on('finish', () => {
        logger.info('HTTP request', {
            requestId,
            method: req.method,
            path,
            status: res.statusCode,
            durationMs: Date.now() - start
        })
    })
    next()
})

app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
        context: async ({ req }): Promise<{ jwtPayload?: JwtPayload }> => {
            const authHeader = req.headers.authorization
            if (authHeader) {
                return {
                    jwtPayload: await getUserFromToken(authHeader)
                }
            }
            return {}
        }
    })
)

app.use(
    '/',
    express.static(path.join(__dirname, 'docs', 'out'), {
        extensions: ['html']
    })
)

app.listen(port, () => {
    logger.info(`Server ready at http://localhost:${port}/graphql`, {
        port,
        env: Bun.env.NODE_ENV ?? 'development',
        logLevel: Bun.env.LOG_LEVEL ?? 'default',
        logFormat: Bun.env.LOG_FORMAT ?? 'default'
    })
})

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', {
        err: reason instanceof Error ? reason : new Error(String(reason))
    })
})

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { err: error })
})
