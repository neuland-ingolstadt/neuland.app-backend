import { deleteUniversitySport } from '@/mutations/university-sports/delete'
import { upsertUniversitySport } from '@/mutations/university-sports/upsert'
import { announcements } from '@/queries/announcements'
import { bus } from '@/queries/bus'
import { charging } from '@/queries/charging'
import { clEvents } from '@/queries/cl-events'
import { food } from '@/queries/food'
import { parking } from '@/queries/parking'
import { sports } from '@/queries/sports'
import { train } from '@/queries/train'

import { deleteAppAnnouncement } from './mutations/app-announcements/delete'
import { upsertAppAnnouncement } from './mutations/app-announcements/upsert'

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
        deleteUniversitySport,
        upsertUniversitySport,
        deleteAppAnnouncement,
        upsertAppAnnouncement,
    },
}
