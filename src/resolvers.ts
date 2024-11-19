import { deleteUniversitySport } from '@/mutations/university-sports/delete'
import { upsertUniversitySport } from '@/mutations/university-sports/upsert'
import { clEvents } from '@/queries/cl-events'
import { food } from '@/queries/food'
import { sports } from '@/queries/sports'
import { GraphQLScalarType, Kind } from 'graphql'
import {
    DateTimeResolver,
    EmailAddressResolver,
    LocalEndTimeResolver,
    URLResolver,
} from 'graphql-scalars'

import { deleteAppAnnouncement } from './mutations/app-announcements/delete'
import { upsertAppAnnouncement } from './mutations/app-announcements/upsert'
import { createRoomReport } from './mutations/room-reports/create'
import { resolveRoomReport } from './mutations/room-reports/resolve'
import { appAnnouncementsQuery } from './queries/appAnnouncements'
import { roomReportsQuery } from './queries/roomReports'

const RestaurantLocation = {
    IngolstadtMensa: 'IngolstadtMensa',
    NeuburgMensa: 'NeuburgMensa',
    Reimanns: 'Reimanns',
    Canisius: 'Canisius',
}

const LocationInput = new GraphQLScalarType({
    name: 'LocationInput',
    description:
        'Custom food input scalar type for handling both enum values and strings. This is used for the migration of the food query to the new schema.',
    parseValue(value) {
        return value // Value from the client input variables
    },
    serialize(value) {
        return value // Value sent to the client
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            const value = ast.value
            if (Object.values(RestaurantLocation).includes(value)) {
                return value // Valid enum value
            }
            return value // String value
        } else if (ast.kind === Kind.ENUM) {
            return ast.value
        }

        throw new Error('LocationInput must be a string or a valid enum value')
    },
})

export const resolvers = {
    Query: {
        food,
        clEvents,
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
        resolveRoomReport,
    },

    LocalTime: LocalEndTimeResolver,
    DateTime: DateTimeResolver,
    EmailAddress: EmailAddressResolver,
    URL: URLResolver,
    LocationInput,
}
