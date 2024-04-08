import gql from 'graphql-tag'

export const chargingType = gql`
    "Charging station data"
    type ChargingStation {
        id: Int!
        name: String!
        address: String!
        city: String!
        latitude: Float!
        longitude: Float!
        available: Int!
        total: Int!
        freeParking: Boolean
        operator: String
    }
`
