interface ParkingData {
    lots: Array<{
        name: string
        available: number
        priceLevel: number | null
    }>
    updated: Date | null
}
