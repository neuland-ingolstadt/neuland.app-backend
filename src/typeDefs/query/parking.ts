import gql from 'graphql-tag'

export const parkingType = gql`
    type ParkingData {
        updated: String!
        lots: [ParkingLot!]!
    }
    type ParkingLot {
        name: String!
        available: Int!
    }
`
