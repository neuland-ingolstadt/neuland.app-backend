import { createUniversitySport } from '@/mutations/university-sports/create'
import { deleteUniversitySport } from '@/mutations/university-sports/delete'
import { updateUniversitySport } from '@/mutations/university-sports/update'
import { announcements } from '@/queries/announcements'
import { bus } from '@/queries/bus'
import { charging } from '@/queries/charging'
import { clEvents } from '@/queries/cl-events'
import { food } from '@/queries/food'
import { parking } from '@/queries/parking'
import { sports } from '@/queries/sports'
import { train } from '@/queries/train'

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
    Mutation: {
        createUniversitySport,
        deleteUniversitySport,
        updateUniversitySport,
    },
}
