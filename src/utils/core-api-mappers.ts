import type { components } from '@neuland-ingolstadt/backend-core-api'
import type {
    Announcement,
    AppPlatformEnum,
    UserKindEnum
} from '@/types/announcement'

type CoreAnnouncement = components['schemas']['Announcement']
type CoreSports = components['schemas']['Sports']
type CoreCampus = components['schemas']['CampusEnum']
type CoreWeekday = components['schemas']['WeekdayEnum']
type CoreSportsCategory = components['schemas']['SportsCategoryEnum']

const CAMPUS_MAP: Record<CoreCampus, CampusType> = {
    INGOLSTADT: 'Ingolstadt',
    NEUBURG: 'Neuburg'
}

const WEEKDAY_MAP: Record<CoreWeekday, WeekdayType> = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
}

const SPORTS_CATEGORY_MAP: Record<CoreSportsCategory, SportsCategoryType> = {
    BASKETBALL: 'Basketball',
    FOOTBALL: 'Soccer',
    CALISTHENICS: 'Calisthenics',
    VOLLEYBALL: 'Volleyball',
    HANDBALL: 'Handball',
    BOULDERING: 'Climbing',
    BADMINTON: 'Badminton',
    TENNIS: 'Tennis',
    SWIMMING: 'Swimming',
    MARTIAL_ARTS: 'MartialArts',
    YOGA: 'Yoga',
    DANCING: 'Dancing',
    STRENGTH_TRAINING: 'StrengthTraining',
    RUNNING: 'Running',
    JOGGING: 'Jogging',
    FRISBEE: 'Frisbee',
    SPIKEBALL: 'Spikeball',
    FULL_BODY_WORKOUT: 'FullBodyWorkout',
    DEFENSE: 'Defense',
    MEDITATION: 'Meditation',
    WATERPOLO: 'Waterpolo',
    CYCLING: 'Cycling',
    BOXING: 'Boxing',
    KICKBOXING: 'Kickboxing',
    TABLE_TENNIS: 'TableTennis',
    ROWING: 'Rowing',
    BASEBALL: 'Baseball',
    SKATEBOARDING: 'Skateboarding',
    PARKOUR: 'Parkour',
    HOCKEY: 'Hockey',
    HIKING: 'Hiking',
    OTHER: 'Other'
}

export function mapCoreAnnouncement(item: CoreAnnouncement): Announcement {
    return {
        id: item.id,
        platform: item.platforms as AppPlatformEnum[],
        userKind: item.userKinds as UserKindEnum[],
        title: {
            de: item.contents.de.title,
            en: item.contents.en.title
        },
        description: {
            de: item.contents.de.description,
            en: item.contents.en.description
        },
        startDateTime: item.startDateTime,
        endDateTime: item.endDateTime,
        priority: item.priority,
        url: item.url ?? null,
        imageUrl: item.imageUrl ?? null
    }
}

function toLocalTime(value: string): string {
    return value.replace(/Z$/, '').replace(/([+-]\d{2}:\d{2})$/, '')
}

export function mapCoreSport(item: CoreSports): UniversitySports {
    return {
        id: item.id,
        title: {
            de: item.contents.de.title,
            en: item.contents.en.title
        },
        description: {
            // Legacy GraphQL returned "" for missing descriptions, not null.
            de: item.contents.de.description ?? '',
            en: item.contents.en.description ?? ''
        },
        campus: CAMPUS_MAP[item.campus],
        location: item.location,
        weekday: WEEKDAY_MAP[item.weekday],
        startTime: toLocalTime(item.startTime),
        endTime: item.endTime ? toLocalTime(item.endTime) : null,
        requiresRegistration: item.requiresRegistration,
        invitationLink: item.invitationLink ?? null,
        eMail: item.email ?? null,
        sportsCategory: SPORTS_CATEGORY_MAP[item.sportsCategory]
    }
}
