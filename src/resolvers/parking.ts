import getParking from '@/scraping/parking'

import { cache } from '../..'

export const parking = async (): Promise<ParkingData> => {
    const data = cache.get<ParkingData>('parking')
    if (data == null) {
        const result = await getParking()
        cache.set('parking', result, 600) // 10 minutes
        return result
    }
    return data
}
