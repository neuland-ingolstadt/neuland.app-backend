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
