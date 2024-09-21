enum CampusType {
    INGOLSTADT = 'Ingolstadt',
    NEUBURG = 'Neuburg',
}

enum WeekdayType {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday',
}

interface UniversitySports {
    id: number
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
    contact?: string
    createdAt: string
    updatedAt: string
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
    contact?: string
}
