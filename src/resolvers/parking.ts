import * as cheerio from 'cheerio'

import { cache } from '../..'

const URL = 'https://www.ingolstadt.de/parken'

export const parking = async (): Promise<{
    lots: Array<{ name: string; available: number }>
    updated: Date | null
}> => {
    try {
        let data = cache.get<ParkingData>('parking')
        if (data == null) {
            const resp = await fetch(URL)
            const body = await resp.text()
            if (resp.status !== 200) {
                throw new Error('Parking data not available')
            }

            const $ = cheerio.load(body)
            let date = null
            const headerText = $('#parkplatzauskunft #header').text()
            const match = headerText.match(/Stand: (.+),/)
            if (match != null) {
                const dateStr = match[1]
                    .replace('.', '/')
                    .replace('.', '/')
                    .replace(' ', 'T')
                    .replace('.', ':')
                date = new Date(dateStr)
            }
            const lots = $('.parkplatz-anzahl')
                .map((_i, el) => ({
                    name: $(el)
                        .parent()
                        .find('.parkplatz-name-kurz')
                        .text()
                        .trim(),
                    available: parseInt($(el).text().trim()),
                }))
                .get()

            data = {
                lots,
                updated: date,
            }
            cache.set('parking', data)
        }
        return data
    } catch (e) {
        console.error(e)
        throw new Error(
            'Unexpected/Malformed response from the Stadt Ingolstadt website!'
        )
    }
}
