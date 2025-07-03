import { cache } from '@/index'
import type { LibrarySeatInfo, LibrarySeatRoom } from '@/types/librarySeats'

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

export async function librarySeatRooms(): Promise<LibrarySeatRoom[]> {
    let data: LibrarySeatRoom[] | undefined =
        await cache.get('librarySeatRooms')
    if (data) {
        return data
    }

    const res = await fetch(ENDPOINT)
    if (!res.ok) {
        throw new Error(`Failed to fetch library seat data: ${res.status}`)
    }

    const rooms: Array<{
        roomID?: string
        baseMapObjectName?: string
        state?: number
    }> = await res.json()

    data = rooms
        .filter(
            (room) =>
                typeof room.baseMapObjectName === 'string' &&
                room.baseMapObjectName.includes('THI_AP')
        )
        .map((room) => {
            const base = room.baseMapObjectName ?? ''
            const match = base.match(/THI_AP\.(\d+)/)
            const number = match ? Number.parseInt(match[1], 10) : NaN

            let location = 'Unknown'
            if (number >= 100 && number < 200) {
                location = 'Lesesaal Nord'
            } else if (number >= 200 && number < 300) {
                location = 'Lesesaal Süd'
            } else if (number >= 300 && number < 400) {
                location = 'Galerie'
            }

            return {
                roomId: room.roomID ?? '',
                available: room.state === 5,
                location,
                number,
            }
        })

    cache.set('librarySeatRooms', data, CACHE_TTL)
    return data
}
