import { cache } from '@/index'
import type { LibrarySeatInfo } from '@/types/librarySeats'

const CACHE_TTL = 60 * 5 // 5 minutes
const ENDPOINT = 'https://vscout.thi.de/artec.vscout/vsfrontend/getRoomStates'

export async function librarySeats(): Promise<LibrarySeatInfo> {
    let data: LibrarySeatInfo | undefined = await cache.get('librarySeats')
    if (data) {
        return data
    }

    const res = await fetch(ENDPOINT)
    if (!res.ok) {
        throw new Error(`Failed to fetch library seat data: ${res.status}`)
    }

    const rooms: Array<{ baseMapObjectName?: string; state?: number }> =
        await res.json()

    const filter = (keyword: string) =>
        rooms.filter(
            (room) =>
                typeof room.baseMapObjectName === 'string' &&
                room.baseMapObjectName.includes(keyword)
        )

    const count = (arr: Array<{ state?: number }>) => ({
        total: arr.length,
        available: arr.filter((room) => room.state === 5).length,
    })

    data = {
        carrel: count(filter('THI_CAR')),
        normalSeat: count(filter('THI_AP')),
        groupWorkRoom: count(filter('THI_AG')),
    }
    cache.set('librarySeats', data, CACHE_TTL)
    return data
}
