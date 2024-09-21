import { createUniversitySport } from '@/mutations/create-university-sport'

import { announcements } from './announcements'
import { bus } from './bus'
import { charging } from './charging'
import { clEvents } from './cl-events'
import { food } from './food'
import { parking } from './parking'
import { sports } from './sports'
import { train } from './train'

export const resolvers = {
    Query: {
        charging,
        parking,
        food,
        clEvents,
        bus,
        train,
        announcements,
        universitySports: sports,
    },
    Mutation: { createUniversitySport },
}
