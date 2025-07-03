import { cache } from '@/index'
import type { LibrarySeatDetail, LibrarySeatInfo } from '@/types/libraryStatus'

interface RoomState {
    roomID?: string
    baseMapObjectName?: string
    state?: number
}

const ROOMS_KEY = 'libraryRooms'

const CACHE_TTL = 60 * 5 // 5 minutes
const ENDPOINT = 'https://vscout.thi.de/artec.vscout/vsfrontend/getRoomStates'

async function fetchRoomStates(): Promise<RoomState[]> {
    let rooms: RoomState[] | undefined = await cache.get(ROOMS_KEY)
    if (!rooms) {
        const res = await fetch(ENDPOINT)
        if (!res.ok) {
            throw new Error(`Failed to fetch library seat data: ${res.status}`)
        }
        rooms = await res.json()
        cache.set(ROOMS_KEY, rooms, CACHE_TTL)
    }
    return rooms
}

export async function libraryStatus(): Promise<LibrarySeatInfo> {
    let data: LibrarySeatInfo | undefined = await cache.get('libraryStatus')
    if (data) {
        return data
    }

    const rooms = await fetchRoomStates()

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
    cache.set('libraryStatus', data, CACHE_TTL)
    return data
}

export async function librarySeatDetails(): Promise<LibrarySeatDetail[]> {
    let data: LibrarySeatDetail[] | undefined =
        await cache.get('librarySeatDetails')
    if (data) {
        return data
    }

    const rooms = await fetchRoomStates()

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

    cache.set('librarySeatDetails', data, CACHE_TTL)
    return data
}
