import demoData from '@/data/demo-data.json'
import fs from 'fs/promises'

const dataStore = `${process.env.STORE}/announcements.json`
const isDev = process.env.NODE_ENV !== 'production'

/**
 * Announcement data.
 * In development mode, this will return demo data.
 */
export async function announcements(): Promise<Announcement[]> {
    if (isDev) {
        return demoData.announcements
    }
    const data = await fs.readFile(dataStore)
    return JSON.parse(data.toString())
}
