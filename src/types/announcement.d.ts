interface Announcement {
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    startDateTime: string
    endDateTime: string
    priority: number
    url: string | null
}
