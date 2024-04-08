interface Train {
    name: string
    destination: string
    plannedTime: Date
    actualTime: Date
    canceled: boolean
    track: string
    url: string | null
}
