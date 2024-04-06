interface ParkingData {
    lots: Array<{
        name: string
        available: number
    }>
    updated: Date | null
}
