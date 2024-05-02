import * as cheerio from 'cheerio'
import { GraphQLError } from 'graphql'

const url =
    'https://mobile.bahn.de/bin/mobil/bhftafel.exe/dox?ld=43120&protocol=https:&rt=1&use_realtime_filter=1&'
const stations: Record<string, string> = {
    nord: 'Ingolstadt Nord#008003076',
    hbf: 'Ingolstadt Hbf',
    audi: 'Ingolstadt Audi#008003074',
}

function dateFromTimestring(str: string): Date | null {
    const match = str.match(/(\d\d):(\d\d)/)
    if (match == null) {
        return null
    }
    const [, hourStr, minuteStr] = match
    const hour = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)
    if (isNaN(hour) || isNaN(minute)) {
        return null
    }
    const now = new Date()
    if (
        now.getHours() > hour ||
        (now.getHours() === hour && now.getMinutes() > minute)
    ) {
        now.setDate(now.getDate() + 1)
    }
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
            const now = new Date()
            const pad2 = (x: number): string => x.toString().padStart(2, '0')

            const paramObj = {
                input: stations[station],
                inputRef: '#',
                date: `+${pad2(now.getDate())}.${pad2(
                    now.getMonth() + 1
                )}.${now.getFullYear()}`,
                time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`, //
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
                    (paramObj as unknown as Record<any, string>)[key]
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
                const actual =
                    $(el).find('.delayOnTime').text().trim() ?? planned
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
    } catch (e: any) {
        throw new GraphQLError('Failed to fetch data: ' + e.message)
    }
}
