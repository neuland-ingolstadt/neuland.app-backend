import gql from 'graphql-tag'

export const parkingType = gql`
    "Parking data"
    type ParkingData {
        updated: String!
        lots: [ParkingLot!]!
    }

    "Parking lot data"
    type ParkingLot {
        name: String!
        available: Int!
        priceLevel: Int
    }
`
