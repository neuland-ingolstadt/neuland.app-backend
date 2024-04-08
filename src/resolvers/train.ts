import getTrain from '@/scraping/train'

import { cache } from '../..'

const CACHE_TTL = 60 // 1 minute

export async function train(
    _: any,
    args: { station: string }
): Promise<Train[]> {
    let trainData: Train[] | undefined = await cache.get(
        `train__${args.station}`
    )

    if (trainData === undefined || trainData === null) {
        trainData = await getTrain(args.station)

        cache.set(`train__${args.station}`, trainData, CACHE_TTL)
    }

    return trainData
}
