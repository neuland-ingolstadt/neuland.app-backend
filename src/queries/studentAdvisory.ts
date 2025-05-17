import { cache } from '@/index'
import getStudentAdvisoryEvents from '@/scraping/studentAdvisory'

const CACHE_TTL_MOODLE = 60 * 60 * 12 // 12 hours

export async function studentAdvisoryEvents(): Promise<StudentAdvisoryEvent[]> {
    let studentAdvisoryEvents: StudentAdvisoryEvent[] | undefined =
        await cache.get('studentAdvisoryEvents')

    if (studentAdvisoryEvents) {
        return studentAdvisoryEvents
    }

    studentAdvisoryEvents = await getStudentAdvisoryEvents()
    cache.set('studentAdvisoryEvents', studentAdvisoryEvents, CACHE_TTL_MOODLE)

    return studentAdvisoryEvents
}
