import stations from '@/data/mobility.json'
import { GraphQLError } from 'graphql'

const MIN_REGEX = /(\d+) min/
const URLS = Object.fromEntries(stations.bus.stations.map((x) => [x.id, x.url]))

/**
 * Parses a relative timestamp such as '0' or '5 min'
 */
function parseDepartureTime(str: string): Date {
    let delta
    if (str === '0') {
        delta = 0
    } else if (MIN_REGEX.test(str)) {
        const match = str.match(MIN_REGEX)
        const minutes = match != null ? match[1] : '0'
        delta = parseInt(minutes) * 60000
    }

    // round up by adding one minute and then rounding down
    const date = new Date(Date.now() + (delta ?? 0) + 60000)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
}

export default async function getBus(station: string): Promise<Bus[]> {
    if (!Object.prototype.hasOwnProperty.call(URLS, station)) {
        throw new GraphQLError(
            'Invalid station ID. Valid IDs are: ' + Object.keys(URLS).join(', ')
        )
    }

    try {
        const departures = async (): Promise<Bus[]> => {
            const resp = await fetch(URLS[station], {
                headers: { Accept: 'application/json' }, // required so that the backend returns proper utf-8
            })
            const body = await resp.text()

            if (resp.status === 200) {
                // sometimes, the API will return malformed JSON that can not be parsed by node
                if (body === '{ error: true }') {
                    throw new Error('Departure times not available')
                }

                const { departures } = JSON.parse(body) as {
                    departures: Departure[]
                }
                return departures.map((departure) => ({
                    route: departure.route,
                    destination: departure.destination,
                    time: parseDepartureTime(departure.strTime),
                }))
            } else {
                throw new Error('Data source returned an error: ' + body)
            }
        }
        return await departures()
    } catch (e) {
        if (e instanceof Error) {
            throw new GraphQLError('Failed to fetch data: ' + e.message)
        } else {
            throw new GraphQLError('Failed to fetch data: Unknown error')
        }
    }
}
