import * as cheerio from 'cheerio'
import { GraphQLError } from 'graphql'
import moment from 'moment-timezone'

const url =
    'https://mobile.bahn.de/bin/mobil/bhftafel.exe/dox?ld=43120&protocol=https:&rt=1&use_realtime_filter=1&'
const stations: Record<string, string> = {
    nord: 'Ingolstadt Nord#008003076',
    hbf: 'Ingolstadt Hbf',
    audi: 'Ingolstadt Audi#008003074',
}

function dateFromTimestring(str: string): Date | null {
    const match = str.match(/(\d\d):(\d\d)/) ?? []
    if (match == null) {
        return null
    }
    const [, hourStr, minuteStr] = match
    const hour = parseInt(String(hourStr))
    const minute = parseInt(String(minuteStr))
    if (isNaN(hour) || isNaN(minute)) {
        return null
    }
    const now = new Date()

    now.setHours(hour)
    now.setMinutes(minute)
    return now
}

export default async function getTrain(station: string): Promise<Train[]> {
    if (!Object.prototype.hasOwnProperty.call(stations, station)) {
        throw new GraphQLError(
            'Invalid station ID. Valid IDs are: ' +
                Object.keys(stations).join(', ')
        )
    }

    try {
        const getTrainDepatures = async (): Promise<Train[]> => {
            const now = moment().tz('Europe/Berlin')
            const paramObj = {
                input: stations[station],
                inputRef: '#',
                date: now.format('DD.MM.YYYY'),
                time: now.format('HH:mm'),
                productsFilter: '1111101000000000', // "Nur Bahn"
                REQTrain_name: '',
                maxJourneys: 10,
                start: 'Suchen',
                boardType: 'Abfahrt',
                ao: 'yes',
            }

            const params = new URLSearchParams()
            for (const key in paramObj) {
                params.append(
                    key,
                    (paramObj as unknown as Record<string, string>)[key]
                )
            }

            const resp = await fetch(url, {
                method: 'POST',
                body: params,
            })
            const body = await resp.text()
            if (resp.status !== 200) {
                throw new Error('Train data not available')
            }

            const $ = cheerio.load(body)
            const departures = $('.sqdetailsDep').map((i, el) => {
                const name = $(el)
                    .find('.bold')
                    .eq(0)
                    .text()
                    .trim()
                    .replace(/\s+/g, ' ')
                const planned = $(el).find('.bold').eq(1).text().trim()
                const actualValue = $(el).find('.delayOnTime').text().trim()
                const actual = actualValue.length > 0 ? actualValue : planned
                const text = $(el).text().trim()
                const canceled = $(el).find('.red').length > 0
                const match = text.match(/>>\n(.*)/) ?? ['']
                const destination = match[1]
                return {
                    name,
                    destination,
                    plannedTime: dateFromTimestring(planned),
                    actualTime: dateFromTimestring(actual),
                    canceled,
                    track: text.substr(text.length - 2).trim(),
                    url: $(el).find('a').attr('href') ?? null,
                }
            })

            return departures.get()
        }
        return await getTrainDepatures()
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new GraphQLError('Failed to fetch data: ' + e.message)
        } else {
            throw new GraphQLError('Failed to fetch data: Unknown error')
        }
    }
}
