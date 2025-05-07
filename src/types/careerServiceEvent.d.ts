interface CareerServiceEvent {
    id: string
    title: string
    date: Date
    availableSlots: number | null
    totalSlots: number | null
    waitingList: number | null
    maxWaitingList: number | null
    url: string
}
