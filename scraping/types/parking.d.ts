interface ParkingData {
    lots: Array<{
        name: string
        category: string
        available: number
        total: number
        priceLevel: number | null
        tendency: number | null
    }>
    updated: moment.Moment
}

interface ParkingDataXML {
    _declaration: Declaration
    parkInfo: ParkInfo
}
interface Declaration {
    _attributes: DeclarationAttributes
}
interface DeclarationAttributes {
    version: string
    encoding: string
}
interface ParkInfo {
    parkInfoQuery: ParkInfoQuery
    arrayOfParkInfoItem: ArrayOfParkInfoItem
}

interface ArrayOfParkInfoItem {
    parkInfoItem: ParkInfoItem[]
}

interface ParkInfoItem {
    name: Free
    categories: Categories
    max: Free
    free: Free
    tendency: Free
}

interface Categories {
    category: Free
}

interface Free {
    _text: string
}

interface ParkInfoQuery {
    _attributes: ParkInfoQueryAttributes
}

interface ParkInfoQueryAttributes {
    id: string
    timestamp: Date
}
