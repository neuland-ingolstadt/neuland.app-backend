import gql from 'graphql-tag'

export const trainType = gql`
    "Train data"
    type Train {
        name: String!
        destination: String!
        plannedTime: String!
        actualTime: String!
        canceled: Boolean!
        track: String
        url: String
    }
`
