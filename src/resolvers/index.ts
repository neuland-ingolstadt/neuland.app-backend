import { charging } from './charging'
import { parking } from './parking'

export const resolvers = {
    Query: {
        charging,
        parking,
    },
}
