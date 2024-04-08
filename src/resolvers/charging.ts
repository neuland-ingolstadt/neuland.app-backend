import staticData from '@/data/mobility.json'

import { cache } from '../..'

const URL =
    'https://app.chargecloud.de/emobility:ocpi/7d25c525838f55d21766c0dfee5ad21f/app/2.0/locations?swlat=48.7555&swlng=11.4146&nelat=48.7767&nelng=11.4439'
export const charging = async (): Promise<ChargingData[]> => {
    try {
        const data = cache.get<ChargingData[]>('charging-stations')
        if (data == null) {
            const resp = await fetch(URL)
            const data = await resp.json()
            if (resp.status !== 200) {
                throw new Error('Charging station data not available')
            }
            const result = data.data.map(
                (entry: {
                    id: any
                    name: string
                    address: any
                    city: any
                    coordinates: { latitude: any; longitude: any }
                    evses: {
                        filter: (arg0: (x: any) => boolean) => {
                            (): any
                            new (): any
                            length: any
                        }
                        length: any
                    }
                    operator: { name: any }
                }) => ({
                    id: entry.id,
                    name: entry.name.trim(),
                    address: entry.address,
                    city: entry.city,
                    latitude: entry.coordinates.latitude,
                    longitude: entry.coordinates.longitude,
                    operator: entry.operator.name,
                    available: entry.evses.filter(
                        (x) => x.status === 'AVAILABLE'
                    ).length,
                    total: entry.evses.length,
                    freeParking:
                        staticData.charging.find((x) => x.id === entry.id)
                            ?.freeParking ?? null,
                })
            )
            cache.set('charging-stations', result, 60)
            return result
        }
        return data
    } catch (e) {
        console.error(e)
        throw new Error('Charging station data not available')
    }
}
