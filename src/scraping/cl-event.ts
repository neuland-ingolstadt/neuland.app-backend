/**
 * @file Fetches Campus Life events from the public Campus Life API and serves them at `/api/events`.
 */

import { GraphQLError } from 'graphql'
import nodeFetch from 'node-fetch'
import type { ClEvent, ClHost, ClText } from '@/types/clEvents'

const API_BASE_URL = 'https://cl.neuland-ingolstadt.de/api/v1'
const EVENTS_ENDPOINT = `${API_BASE_URL}/public/events`
const ORGANIZERS_ENDPOINT = `${API_BASE_URL}/public/organizers`

interface CampusLifeApiEvent {
  id: number
  organizer_id: number
  title_de: string
  title_en: string
  description_de: string | null
  description_en: string | null
  start_date_time: string
  end_date_time: string | null
  event_url: string | null
  location: string | null
}

interface CampusLifeApiOrganizer {
  id: number
  name: string
  website_url: string | null
  instagram_url: string | null
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await nodeFetch(url, {
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new GraphQLError('Failed to fetch Campus Life data.')
  }

  return (await response.json()) as T
}

function parseDate(value: string | null): Date | null {
  if (value == null) {
    return null
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    console.warn('Received invalid date from Campus Life API:', value)
    return null
  }

  return parsed
}

function buildDescriptions(
  descriptionDe: string | null,
  descriptionEn: string | null
): ClText | null {
  if (descriptionDe == null && descriptionEn == null) {
    return null
  }

  const fallback = descriptionDe ?? descriptionEn ?? ''

  return {
    de: descriptionDe ?? fallback,
    en: descriptionEn ?? fallback
  }
}

function toClEvent(
  event: CampusLifeApiEvent,
  organizer: CampusLifeApiOrganizer | undefined
): ClEvent | null {
  const startDate = parseDate(event.start_date_time)

  if (startDate == null) {
    console.warn(
      'Skipping Campus Life event without valid start date:',
      event.id
    )
    return null
  }

  const endDate = parseDate(event.end_date_time)
  const organizerName = organizer?.name ?? 'Unknown Organizer'

  const host: ClHost = {
    name: organizerName,
    website: organizer?.website_url ?? null,
    instagram: organizer?.instagram_url ?? null
  }

  const description = event.description_de ?? event.description_en ?? null
  const descriptions = buildDescriptions(
    event.description_de,
    event.description_en
  )

  const title = event.title_de ?? event.title_en

  return {
    id: event.id.toString(),
    organizer: organizerName,
    host,
    title,
    titles: {
      de: event.title_de,
      en: event.title_en
    },
    description,
    descriptions,
    begin: startDate,
    startDateTime: startDate,
    end: endDate,
    endDateTime: endDate,
    location: event.location,
    eventWebsite: event.event_url,
    isMoodleEvent: false
  }
}

function isUpcoming(event: ClEvent, now: Date): boolean {
  const startTime = event.begin.getTime()
  const endTime = event.end?.getTime() ?? null

  return (
    startTime >= now.getTime() || (endTime != null && endTime >= now.getTime())
  )
}

export default async function getClEvents(): Promise<ClEvent[]> {
  try {
    const [events, organizers] = await Promise.all([
      fetchJson<CampusLifeApiEvent[]>(EVENTS_ENDPOINT),
      fetchJson<CampusLifeApiOrganizer[]>(ORGANIZERS_ENDPOINT)
    ])

    const organizersById = new Map(
      organizers.map((organizer) => [organizer.id, organizer])
    )

    const now = new Date()

    const combinedEvents = events
      .map((event) => toClEvent(event, organizersById.get(event.organizer_id)))
      .filter((event): event is ClEvent => event != null)
      .filter((event) => isUpcoming(event, now))
      .sort((a, b) => a.begin.getTime() - b.begin.getTime())

    return combinedEvents
  } catch (e: unknown) {
    if (e instanceof GraphQLError) {
      console.error(e)
      throw e
    }

    if (e instanceof Error) {
      console.error(e)
      throw new GraphQLError(`Unexpected error: ${e.message}`)
    }

    console.error('Unexpected error:', e)
    throw new GraphQLError('Unexpected error')
  }
}
