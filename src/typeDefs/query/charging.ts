import gql from 'graphql-tag'

export const chargingType = gql`
    type ChargingStation {
        id: Int!
        name: String!
        address: String!
        city: String!
        latitute: Float!
        longitude: Float!
        available: Int!
        total: Int!
    }
`
