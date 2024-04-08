import gql from 'graphql-tag'

export const clEventsType = gql`
    "Campus Life Event"
    type ClEvent {
        id: ID!
        organizer: String!
        title: String!
        begin: String!
        end: String!
    }
`
