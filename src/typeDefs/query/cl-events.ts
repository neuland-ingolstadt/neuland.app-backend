import gql from 'graphql-tag'

export const clEventsType = gql`
    type ClEvent {
        id: ID!
        organizer: String!
        title: String!
        begin: String!
        end: String!
    }
    type Query {
        clEvents: [ClEvent!]!
    }
`
