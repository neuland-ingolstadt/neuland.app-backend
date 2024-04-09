import { ApolloServer } from '@apollo/server'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default'
import { apolloIntegration } from '@chrisenglert/as-integrations-bun'
import NodeCache from 'node-cache'

import { resolvers } from './src/resolvers'
import { typeDefs } from './src/schema'

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
