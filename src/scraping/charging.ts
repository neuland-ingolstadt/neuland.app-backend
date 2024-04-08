import staticData from '@/data/mobility.json'

const URL =
    'https://app.chargecloud.de/emobility:ocpi/7d25c525838f55d21766c0dfee5ad21f/app/2.0/locations?swlat=48.7555&swlng=11.4146&nelat=48.7767&nelng=11.4439'

export const getCharging = async (): Promise<ChargingData[]> => {
    try {
        const resp = await fetch(URL)
        const data = await resp.json()
        if (resp.status !== 200) {
            throw new Error('Charging station data not available')
        }
        const result = data.data.map(
            (entry: {
                id: number
                name: string
                address: string
                city: string
                coordinates: { latitude: number; longitude: number }
                evses: {
                    filter: (arg0: (x: any) => boolean) => {
                        (): number
                        new (): number
                        length: number
                    }
                    length: number
                }
                operator: { name: string }
            }) => ({
                id: entry.id,
                name: entry.name.trim(),
                address: entry.address,
                city: entry.city,
                latitude: entry.coordinates.latitude,
                longitude: entry.coordinates.longitude,
                operator: entry.operator.name,
                available: entry.evses.filter((x) => x.status === 'AVAILABLE')
                    .length,
                total: entry.evses.length,
                freeParking:
                    staticData.charging.find(
                        (x) => (x.id as unknown as number) === entry.id
                    )?.freeParking ?? null,
            })
        )

        return result
    } catch (e) {
        console.error(e)
        throw new Error('Charging station data not available')
    }
}
