import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default'
import cors from 'cors'
import express from 'express'
import { readFileSync } from 'fs'
import NodeCache from 'node-cache'

import { resolvers } from './src/resolvers'

const typeDefs = readFileSync('./src/schema.gql', { encoding: 'utf-8' })

const app = express()
app.use(
    cors({
        origin: 'https://studio.apollographql.com',
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
await apolloServer.start()

app.get('/', (req, res) => {
    res.redirect(301, 'https://docs.neuland.ing')
})

app.use('/graphql', cors(), express.json(), expressMiddleware(apolloServer))

app.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`)
})
