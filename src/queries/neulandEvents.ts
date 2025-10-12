import { db } from '@/db'
import { neulandEvents } from '@/db/schema/neulandEvents'
import type { NeulandEvent } from '@/types/neulandEvents'

export async function neulandEventsQuery(): Promise<NeulandEvent[]> {
  const data = await db.select().from(neulandEvents)

  return data.map((event) => ({
    id: event.id,
    title: {
      de: event.title_de,
      en: event.title_en
    },
    description: {
      de: event.description_de,
      en: event.description_en
    },
    location: event.location,
    createdAt: event.created_at,
    startTime: event.start_time,
    endTime: event.end_time,
    rrule: event.rrule,
    updatedAt: event.updated_at
  }))
}
