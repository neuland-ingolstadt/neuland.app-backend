import { ApolloServer } from '@apollo/server'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default'
import { apolloIntegration } from '@chrisenglert/as-integrations-bun'
import { readFileSync } from 'fs'
import NodeCache from 'node-cache'

import { resolvers } from './src/resolvers'

const typeDefs = readFileSync('./src/schema.gql', { encoding: 'utf-8' })

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

export const cache = new NodeCache({ stdTTL: 60 * 10 })

await apolloServer.start()

const server = Bun.serve(
    apolloIntegration({
        apolloServer,
        port: 4000,
        context: async (req) => {
            return {
                req,
            }
        },
    })
)

console.log(`🚀 Server ready at ${server.url.toString()}`)
