/**
 * @file Scrapes events from the `Campus Life` Moodle course and serves them at `/api/events`.
 */
import clubsData from '@/data/clubs.json'
import { MONTHS, type Month, login } from '@/utils/moodle-utils'
import { xxh64 } from '@node-rs/xxhash'
import * as cheerio from 'cheerio'
import fetchCookie, { type FetchCookieImpl } from 'fetch-cookie'
import { GraphQLError } from 'graphql'
import he from 'he'
import moment from 'moment-timezone'
import nodeFetch from 'node-fetch'
import sanitizeHtml from 'sanitize-html'

const PUBLIC_EVENT_KEY = 'Veröffentlichung des Ortes & Bescheibung in Apps' // sic (see Moodle)

const EVENT_LIST_2_URL =
    'https://moodle.thi.de/mod/dataform/view.php?d=19&view=18&filter=9'
const EVENT_DETAILS_PREFIX = 'https://moodle.thi.de/mod/dataform/view.php'

/**
 * Parses a date like "Donnerstag, 15. Juni 2023, 10:00".
 * @param {string} str
 * @returns {Date}
 */
function parseLocalDateTime(str: string): Date {
    const match = str.match(/, (\d+). (\p{Letter}+) (\d+), (\d+):(\d+)$/u)
    if (!match) throw new Error(`Invalid date string: ${str}`)
    const [, day, month, year, hour, minute] = match
    const typedMonth = month as Month

    // Create a date string and parse it in the Europe/Berlin time zone
    const dateString = `${day}-${MONTHS[typedMonth]}-${year} ${hour}:${minute}`
    const date = moment.tz(dateString, 'D-M-YYYY H:mm', 'Europe/Berlin')

    // Convert to UTC and return a JavaScript Date
    return date.utc().toDate()
}

/**
 * Fetch a list of event URLs.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 * @returns {string[]}
 */
async function getEvents(
    fetch: FetchCookieImpl<
        nodeFetch.RequestInfo,
        nodeFetch.RequestInit,
        nodeFetch.Response
    >
): Promise<ClEvent[]> {
    let pageNr = 0
    const data: ClEvent[] = []
    const now = new Date()

    while (true) {
        const pageUrl = `${EVENT_LIST_2_URL}&page=${pageNr}`
        const event = await getEventDetails(fetch, pageUrl)

        if (!event) {
            break
        }

        const beginDate = event.begin ? new Date(event.begin) : null
        const endDate = event.end ? new Date(event.end) : null

        if (
            // No end date and begin date is in the past
            (beginDate && beginDate < now && !endDate) ||
            // No begin date and end date is in the past
            (endDate && endDate < now && !beginDate) ||
            // Both dates are in the past
            (beginDate && beginDate < now && endDate && endDate < now)
        ) {
            console.debug(
                'No more future events found. Number of events:',
                data.length
            )
            break
        }

        if ((beginDate && beginDate > now) || (endDate && endDate > now)) {
            if (!beginDate && endDate) {
                console.debug(
                    'Event has only end date defined, discarding:',
                    event
                )
                pageNr++
                continue
            }
            data.push(event as ClEvent)
        } else {
            console.debug('Event does not have valid dates:', event)
        }
        pageNr++
    }

    // The events are fetched from future to past, so we reverse the array
    return data.reverse()
}

/**
 * Fetches event details from an event URL.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 * @param {string} url
 */
async function getEventDetails(
    fetch: FetchCookieImpl<
        nodeFetch.RequestInfo,
        nodeFetch.RequestInit,
        nodeFetch.Response
    >,
    url: string
): Promise<ScrapedClEvent | null> {
    if (!url.startsWith(EVENT_DETAILS_PREFIX)) {
        throw new Error('Invalid URL')
    }

    const resp: nodeFetch.Response = await fetch(url)
    const $ = cheerio.load(await resp.text())
    const rows = $('.entry tr:not(.lastrow)').get()

    if (rows.length === 0) {
        console.debug(`No event data rows found on ${url}`)
        return null
    }

    const details = Object.fromEntries(
        rows.map((elem) => {
            const htmlContent = $(elem).find('.c1').html()

            const adjustedC1 =
                htmlContent === null
                    ? ''
                    : he.decode(
                          sanitizeHtml(
                              htmlContent
                                  .replace(/<br\s*\/?>/gi, '\n')
                                  .replace(/<\/?p>/gi, '\n'),
                              {
                                  allowedTags: [],
                                  allowedAttributes: {},
                                  disallowedTagsMode: 'discard',
                              }
                          )
                      )

            return [
                $(elem).find('.c0').text().trim().replace(/:$/, ''),
                adjustedC1.trim().replace(/:$/, ''),
            ]
        })
    )

    const publicEvent = details[PUBLIC_EVENT_KEY] === 'Ja'
    const trimmedOrganizer = details.Verein.trim()
        .replace(/( \.)$/g, '')
        .replace(/e\. V\./g, 'e.V.')
    const trimmedEvent = details.Event.trim()
    const trimmedDescription =
        publicEvent &&
        details.Beschreibung != null &&
        details.Beschreibung !== ''
            ? details.Beschreibung.trim()
            : null

    const parsedStartDateTime = details.Start
        ? parseLocalDateTime(details.Start)
        : null
    let parsedEndDateTime = details.Ende
        ? parseLocalDateTime(details.Ende)
        : null

    // If both start and end dates are parsed, and end is not after start, nullify end.
    if (
        parsedStartDateTime &&
        parsedEndDateTime &&
        parsedEndDateTime.getTime() <= parsedStartDateTime.getTime()
    ) {
        parsedEndDateTime = null
    }

    const startDateString = parsedStartDateTime
        ? parsedStartDateTime.toISOString()
        : 'null-start'
    const endDateString = parsedEndDateTime
        ? parsedEndDateTime.toISOString()
        : 'null-end'

    const eventIdString = `${trimmedOrganizer}-${trimmedEvent}-${startDateString}-${endDateString}`

    return {
        id: xxh64(eventIdString, 123n).toString(16),
        organizer: trimmedOrganizer, // deprecated in favor of host
        host: getHostDetails(trimmedOrganizer),
        title: trimmedEvent,
        titles: {
            de: trimmedEvent,
            en: trimmedEvent,
        },
        begin: parsedStartDateTime,
        startDateTime: parsedStartDateTime,
        end: parsedEndDateTime,
        endDateTime: parsedEndDateTime,
        location: publicEvent ? details.Ort : null,
        description: trimmedDescription,
        descriptions:
            trimmedDescription != null
                ? {
                      de: trimmedDescription,
                      en: trimmedDescription,
                  }
                : null,
        eventWebsite: null, // not available in Moodle
        isMoodleEvent: true,
    }
}

function getHostDetails(host: string): ClHost {
    const club = clubsData.find((club) => club.club === host)
    if (!club) {
        return {
            name: host,
            website: null,
            instagram: null,
        }
    }

    return {
        name: club.club,
        website: club.website,
        instagram: club.instagram,
    }
}

/**
 * Fetches all event details from Moodle.
 * @param {string} username
 * @param {string} password
 */
export async function getAllEventDetails(
    username: string,
    password: string
): Promise<ClEvent[]> {
    const fetch = fetchCookie(nodeFetch)

    await login(fetch, username, password)

    const events = await getEvents(fetch)

    // Filter out duplicate events based on their ID
    const uniqueEvents: ClEvent[] = []
    const seenEventIds = new Set<string>()

    for (const event of events) {
        if (event.id && !seenEventIds.has(event.id)) {
            uniqueEvents.push(event)
            seenEventIds.add(event.id)
        } else if (event.id && seenEventIds.has(event.id)) {
            console.debug('Duplicate event found, skipping:', event.id)
        } else if (!event.id) {
            console.warn('Event without ID found, skipping')
        }
    }

    return uniqueEvents
}

export default async function getClEvents(): Promise<ClEvent[]> {
    try {
        const username = Bun.env.MOODLE_USERNAME
        const password = Bun.env.MOODLE_PASSWORD

        if (username && password) {
            const events = await getAllEventDetails(username, password)
            return events
        } else {
            throw new GraphQLError('MOODLE_CREDENTIALS_NOT_CONFIGURED')
        }
    } catch (e: unknown) {
        if (e instanceof GraphQLError) {
            console.error(e)
            throw e
        } else if (e instanceof Error) {
            console.error(e)
            throw new GraphQLError('Unexpected error: ' + e.message)
        } else {
            console.error('Unexpected error:', e)
            throw new GraphQLError('Unexpected error')
        }
    }
}
