import demoData from '@/data/demo-data.json'
import fs from 'fs/promises'

const dataStore = `${Bun.env.STORE}/announcements.json`
const isDev = Bun.env.NODE_ENV !== 'production'

/**
 * Announcement data.
 * In development mode, this will return demo data.
 */
export async function announcements(): Promise<Announcement[]> {
    if (isDev) {
        return demoData.announcements
    }
    const fileHandle = await fs.open(dataStore, 'a+')
    const data = await fileHandle.readFile()
    await fileHandle.close()
    const fileContent = data.toString()
    return fileContent.length > 0 ? JSON.parse(fileContent) : []
}
