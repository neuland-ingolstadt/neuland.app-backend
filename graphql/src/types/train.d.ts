interface Train {
    name: string
    destination: string
    plannedTime: Date | null
    actualTime: Date | null
    canceled: boolean
    track: string
    url: string | null
}
