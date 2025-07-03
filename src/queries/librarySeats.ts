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

    const seats = rooms.filter(
        (room) =>
            typeof room.baseMapObjectName === 'string' &&
            room.baseMapObjectName.includes('THI_AP')
    )

    const totalSeats = seats.length
    const availableSeats = seats.filter((seat) => seat.state === 5).length

    data = { availableSeats, totalSeats }
    cache.set('librarySeats', data, CACHE_TTL)
    return data
}
