interface CareerServiceEvent {
    id: string
    title: string
    description: string
    date: Date
    url: string
    publishedDate: Date
    // Deprecated fields - kept for backward compatibility
    unlimitedSlots?: boolean | null
    availableSlots?: number | null
    totalSlots?: number | null
    waitingList?: number | null
    maxWaitingList?: number | null
}
