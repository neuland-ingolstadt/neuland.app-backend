import gql from 'graphql-tag'

export const busType = gql`
    "Charging station data"
    type Bus {
        route: String!
        destination: String!
        time: String!
    }
`
