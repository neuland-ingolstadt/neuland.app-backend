import { cache } from '@/index'
import getStudentCounsellingEvents from '@/scraping/studentCounselling'
import type { StudentCounsellingEvent } from '@/types/studentCounsellingEvent'

const CACHE_TTL_MOODLE = 60 * 60 * 12 // 12 hours

export async function studentCounsellingEvents(): Promise<
  StudentCounsellingEvent[]
> {
  let studentCounsellingEvents: StudentCounsellingEvent[] | undefined =
    await cache.get('studentCounsellingEvents')

  if (studentCounsellingEvents) {
    return studentCounsellingEvents
  }

  studentCounsellingEvents = await getStudentCounsellingEvents()
  cache.set(
    'studentCounsellingEvents',
    studentCounsellingEvents,
    CACHE_TTL_MOODLE
  )

  return studentCounsellingEvents
}
