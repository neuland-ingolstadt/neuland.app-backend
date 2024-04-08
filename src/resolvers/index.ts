import { bus } from './bus'
import { charging } from './charging'
import { clEvents } from './cl-events'
import { food } from './food'
import { parking } from './parking'

export const resolvers = {
    Query: {
        charging,
        parking,
        food,
        clEvents,
        bus,
    },
}
