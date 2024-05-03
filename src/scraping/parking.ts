import staticData from '@/data/mobility.json'
import moment from 'moment-timezone'
import xmljs from 'xml-js'

const URL = 'https://www.ingolstadt-ifg.de/typo3temp/parkinfo.xml'

const getParking = async (): Promise<ParkingData> => {
    try {
        const resp = await fetch(URL)
        const body = await resp.text()
        if (resp.status !== 200) {
            throw new Error('Parking data not available')
        }

        const xml = JSON.parse(
            xmljs.xml2json(body, { compact: true, spaces: 4 })
        ) as ParkingDataXML
        const timestamp = xml.parkInfo.parkInfoQuery._attributes.timestamp
        const date = moment.tz(timestamp, 'Europe/Berlin')

        const adjustedTendency = {
            '-1': null,
            '1': -1,
            '2': 1,
            '3': 0,
        }

        const adjustedCategory = {
            Tiefgarage: 'Underground Parking',
            Parkhaus: 'Parking Garage',
            'Offene Fläche': 'Open Area',
        }

        const lots = xml.parkInfo.arrayOfParkInfoItem.parkInfoItem.map(
            (item: ParkInfoItem) => {
                const name = item.name._text.trim()
                const available = parseInt(item.free._text.trim())
                const total = parseInt(item.max._text.trim())
                const tendency =
                    adjustedTendency[
                        item.tendency._text
                            .trim()
                            .toString() as keyof typeof adjustedTendency
                    ]
                const category =
                    adjustedCategory[
                        item.categories.category._text.trim() as keyof typeof adjustedCategory
                    ] ?? item.categories.category._text.trim()

                return {
                    name,
                    category,
                    total,
                    available,
                    tendency,
                    priceLevel:
                        staticData.parking.find((x) => x.name === name)
                            ?.priceLevel ?? null,
                }
            }
        )

        return {
            lots,
            updated: date,
        }
    } catch (e) {
        console.error(e)
        throw new Error(
            'Unexpected/Malformed response from the Stadt Ingolstadt website!'
        )
    }
}

export default getParking
