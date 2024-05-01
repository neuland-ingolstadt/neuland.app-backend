import { getCharging } from '@/scraping/charging'

import { cache } from '../..'

export const charging = async (): Promise<ChargingData[]> => {
    const data = cache.get<ChargingData[]>('chargingStations')
    if (data == null) {
        const result = await getCharging()
        cache.set('chargingStations', result, 600) // 10 minutes
        return result
    }
    return data
}
