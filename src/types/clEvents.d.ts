export interface ClEvent {
    id: string
    organizer: string
    host: ClHost
    title: string
    begin: Date | null
    end: Date | null
    location: string | null
    description: string | null
}

export interface ClHost {
    name: string
    website: string | null
    instagram: string | null
}
