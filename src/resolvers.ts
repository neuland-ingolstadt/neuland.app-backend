import { deleteUniversitySport } from '@/mutations/university-sports/delete'
import { upsertUniversitySport } from '@/mutations/university-sports/upsert'
import { bus } from '@/queries/bus'
import { charging } from '@/queries/charging'
import { clEvents } from '@/queries/cl-events'
import { food } from '@/queries/food'
import { parking } from '@/queries/parking'
import { sports } from '@/queries/sports'
import { train } from '@/queries/train'
import {
    DateTimeResolver,
    EmailAddressResolver,
    LocalEndTimeResolver,
} from 'graphql-scalars'

import { deleteAppAnnouncement } from './mutations/app-announcements/delete'
import { upsertAppAnnouncement } from './mutations/app-announcements/upsert'
import { createRoomReport } from './mutations/createRoomReport'
import { appAnnouncementsQuery } from './queries/appAnnouncements'
import { roomReportsQuery } from './queries/roomReports'

export const resolvers = {
    Query: {
        charging,
        parking,
        food,
        clEvents,
        bus,
        train,
        appAnnouncements: appAnnouncementsQuery,
        announcements: appAnnouncementsQuery,
        universitySports: sports,
        roomReports: roomReportsQuery,
    },
    Mutation: {
        deleteUniversitySport,
        upsertUniversitySport,
        deleteAppAnnouncement,
        upsertAppAnnouncement,
        createRoomReport,
    },

    LocalTime: LocalEndTimeResolver,
    DateTime: DateTimeResolver,
    EmailAddress: EmailAddressResolver,
}
