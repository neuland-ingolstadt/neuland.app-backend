interface ClEvent {
    id: string
    organizer: string
    host: ClHost
    title: ClText
    description: ClText | null
    begin: Date
    end: Date | null
    location: string | null
    eventWebsite: string | null
    isMoodleEvent: boolean
}

interface ScrapedClEvent {
    id: string
    organizer: string
    host: ClHost
    title: ClText
    description: ClText | null
    begin: Date | null
    end: Date | null
    location: string | null
    eventWebsite: string | null
    isMoodleEvent: boolean
}

interface ClHost {
    name: string
    website: string | null
    instagram: string | null
}

interface ClText {
    de: string
    en: string
}

interface ManualClEventsInput {
    host: ClHost
    title: ClText
    description: ClText | null
    begin: Date
    end: Date | null
    location: string | null
    eventWebsite: string | null
}
