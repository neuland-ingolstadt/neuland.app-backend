interface Announcement {
    id: number
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    startDateTime: Date | string
    endDateTime: Date | string
    priority: number
    url: string | null
    createdAt: Date
    updatedAt: Date
}

interface AnnouncementInput {
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    startDateTime: Date
    endDateTime: Date
    priority: number
    url: string | null
}
