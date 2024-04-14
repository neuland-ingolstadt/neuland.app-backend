export interface ClEvent {
    id: string
    organizer: string
    title: string
    begin: Date | null
    end: Date | null
    location: string | null
    description: string | null
}
