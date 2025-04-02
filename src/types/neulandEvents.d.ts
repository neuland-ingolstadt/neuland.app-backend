interface NeulandEvent {
    id: number
    title: {
        en: string
        de: string
    }
    description: {
        en: string | null
        de: string | null
    }
    location: string | null
    createdAt: Date
    updatedAt: Date | null
    startTime: Date
    endTime: Date
    rrule: string | null
}

type NeulandEventInput = Omit<NeulandEvent, 'id' | 'createdAt' | 'updatedAt'>
