import getBus from '@/scraping/bus'

import { cache } from '../..'

const CACHE_TTL = 60 // 1 minute

export async function bus(_: any, args: { station: string }): Promise<Bus[]> {
    let busData: Bus[] | undefined = await cache.get(`bus__${args.station}`)

    if (busData === undefined || busData === null) {
        busData = await getBus(args.station)
        cache.set(`bus__${args.station}`, busData, CACHE_TTL)
    }

    return busData
}
