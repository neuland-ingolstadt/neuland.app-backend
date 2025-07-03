interface LibrarySeatStatus {
    available: number
    total: number
}

interface LibrarySeatInfo {
    carrel: LibrarySeatStatus
    normalSeat: LibrarySeatStatus
    groupWorkRoom: LibrarySeatStatus
}

interface LibrarySeatRoom {
    roomId: string
    available: boolean
    location: string
    number: number
}
