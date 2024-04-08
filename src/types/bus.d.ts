interface Bus {
    route: string
    destination: string
    time: Date
}

interface Departure {
    route: string
    destination: string
    strTime: string
    lowfloor: boolean
    realtime: boolean
    traction: number
}
