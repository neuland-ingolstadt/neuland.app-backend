import gql from 'graphql-tag'

import { announcementsType } from './announcements'
import { busType } from './bus'
import { chargingType } from './charging'
import { clEventsType } from './cl-events'
import { foodType } from './food'
import { parkingType } from './parking'
import { trainType } from './train'

export const queryType = gql`
    ${chargingType}
    ${parkingType}
    ${foodType}
    ${clEventsType}
    ${busType}
    ${trainType}
    ${announcementsType}
    "Root query"
    type Query {
        parking: ParkingData
        charging: [ChargingStation!]!
        food(locations: [String!]): [Food!]!
        clEvents: [ClEvent!]!
        bus(station: String!): [Bus!]!
        train(station: String!): [Train!]!
        announcements: [Announcement!]!
    }
`
