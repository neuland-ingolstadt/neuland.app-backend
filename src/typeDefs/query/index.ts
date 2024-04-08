import gql from 'graphql-tag'

import { chargingType } from './charging'
import { clEventsType } from './cl-events'
import { foodType } from './meal'
import { parkingType } from './parking'

export const queryType = gql`
    ${chargingType}
    ${parkingType}
    ${foodType}
    ${clEventsType}
    type Query {
        parking: ParkingData
        charging: [ChargingStation!]!
        food: [Food!]!
        clEvents: [ClEvent!]!
    }
`
