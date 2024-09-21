interface Announcement {
    id: string
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
    startDateTime: number
    endDateTime: number
    priority: number
    url: string | null
}
