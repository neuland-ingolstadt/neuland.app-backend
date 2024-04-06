import { ApolloServer } from '@apollo/server'
import { apolloIntegration } from '@chrisenglert/as-integrations-bun'
import NodeCache from 'node-cache'

import { resolvers } from './src/resolvers'
import { typeDefs } from './src/typeDefs'

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
})

export const cache = new NodeCache({ stdTTL: 60 * 10 })

await apolloServer.start()

const server = Bun.serve(
    apolloIntegration({
        apolloServer,
        port: 4040,
        context: async (req) => {
            return {
                req,
            }
        },
    })
)

console.log(`🚀 Server ready at ${server.url.toString()}`)
