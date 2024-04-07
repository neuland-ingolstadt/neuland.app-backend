import gql from 'graphql-tag'

import { chargingType } from './charging'
import { foodType } from './meal'
import { parkingType } from './parking'

export const queryType = gql`
    ${chargingType}
    ${parkingType}
    ${foodType}
    type Query {
        parking: ParkingData
        charging: [ChargingStation!]!
        food: [Food!]!
    }
`
