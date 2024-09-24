type CampusType = 'Ingolstadt' | 'Neuburg'

type WeekdayType =
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'

interface UniversitySports {
    id: number
    title: {
        de: string
        en: string
    }
    description: {
        de: string | null
        en: string | null
    }
    campus: CampusType
    location: string
    weekday: WeekdayType
    startTime: string
    endTime: string | null
    requiresRegistration: boolean
    invitationLink: string | null
    eMail: string | null
    createdAt: Date
    updatedAt: Date
}

interface UniversitySportInput {
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    campus: CampusType
    location: string
    weekday: WeekdayType
    startTime: string
    endTime?: string
    requiresRegistration: boolean
    invitationLink?: string
    eMail?: string
}
