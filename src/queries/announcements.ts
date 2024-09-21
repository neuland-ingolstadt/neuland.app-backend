import demoData from '@/data/demo-data.json'
import crypto from 'crypto'
import fs from 'fs/promises'

const dataStore = `${Bun.env.STORE}/announcements.json`
const isDev = Bun.env.NODE_ENV !== 'production'

/**
 * Announcement data.
 * In development mode, this will return demo data.
 */
export async function announcements(): Promise<Announcement[]> {
    if (isDev) {
        return demoData.announcements.map((announcement) => {
            const id = crypto
                .createHash('md5')
                .update(announcement.title.en + announcement.startDateTime)
                .digest('hex')
            const startDateTime = new Date(announcement.startDateTime)
            const endDateTime = new Date(announcement.endDateTime)
            return { ...announcement, id, startDateTime, endDateTime }
        })
    }

    let fileHandle
    try {
        fileHandle = await fs.open(dataStore, 'a+')
        const data = await fileHandle.readFile()
        const fileContent = data.toString()

        if (fileContent.length === 0) {
            return []
        }

        return JSON.parse(fileContent).map((announcement: Announcement) => ({
            ...announcement,
            id: crypto
                .createHash('md5')
                .update(
                    announcement.title.en +
                        announcement.startDateTime.toString()
                )
                .digest('hex'),
            startDateTime: new Date(announcement.startDateTime),
            endDateTime: new Date(announcement.endDateTime),
        }))
    } finally {
        if (fileHandle != null) {
            await fileHandle.close()
        }
    }
}
