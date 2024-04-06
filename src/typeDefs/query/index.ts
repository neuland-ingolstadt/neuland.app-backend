import gql from 'graphql-tag'

import { chargingType } from './charging'
import { parkingType } from './parking'

export const queryType = gql`
    ${chargingType}
    ${parkingType}
    type Query {
        parking: ParkingData
        charging: [ChargingStation!]!
    }
`
