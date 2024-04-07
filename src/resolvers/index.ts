import { charging } from './charging'
import { food } from './food'
import { parking } from './parking'

export const resolvers = {
    Query: {
        charging,
        parking,
        food,
    },
}
