/**
 * @file Scrapes events from the `Campus Life` Moodle course and serves them at `/api/events`.
 */
import clubsData from '@/data/clubs.json'
import { xxh64 } from '@node-rs/xxhash'
import * as cheerio from 'cheerio'
import fetchCookie, { type FetchCookieImpl } from 'fetch-cookie'
import { GraphQLError } from 'graphql'
import he from 'he'
import moment from 'moment-timezone'
import nodeFetch from 'node-fetch'
import sanitizeHtml from 'sanitize-html'

const MONTHS = {
    Januar: 1,
    Februar: 2,
    März: 3,
    April: 4,
    Mai: 5,
    Juni: 6,
    Juli: 7,
    August: 8,
    September: 9,
    Oktober: 10,
    November: 11,
    Dezember: 12,
}

const LOGIN_URL = 'https://moodle.thi.de/login/index.php'
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
    type Month =
        | 'Januar'
        | 'Februar'
        | 'März'
        | 'April'
        | 'Mai'
        | 'Juni'
        | 'Juli'
        | 'August'
        | 'September'
        | 'Oktober'
        | 'November'
        | 'Dezember'

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
 * Fetches a login XSRF token.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 */
async function fetchToken(
    fetch: FetchCookieImpl<
        nodeFetch.RequestInfo,
        nodeFetch.RequestInit,
        nodeFetch.Response
    >
): Promise<string> {
    const resp: nodeFetch.Response = await fetch(LOGIN_URL)
    const $ = cheerio.load(await resp.text())
    const token = $('input[name=logintoken]').val()

    if (typeof token === 'string') {
        return token
    } else if (Array.isArray(token)) {
        return token[0]
    } else {
        throw new Error('Token not found')
    }
}

/**
 * Logs into Moodle.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 * @param {string} username
 * @param {string} password
 */
async function login(
    fetch: FetchCookieImpl<
        nodeFetch.RequestInfo,
        nodeFetch.RequestInit,
        nodeFetch.Response
    >,
    username: string,
    password: string
): Promise<void> {
    const data = new URLSearchParams()
    data.append('anchor', '')
    data.append('logintoken', await fetchToken(fetch))
    data.append('username', username)
    data.append('password', password)

    const resp: nodeFetch.Response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString(),
    })
    const $ = cheerio.load(await resp.text())
    if ($('#loginerrormessage').length > 0) {
        throw new GraphQLError('Login failed')
    }
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

    const details = Object.fromEntries(
        rows.map((elem) => {
            const htmlContent = $(elem).find('.c1').html()

            const adjustedC1 =
                htmlContent === null
                    ? ''
                    : he.decode(
                          sanitizeHtml(
                              htmlContent.replace(/<br\s*\/?>/gi, '\n'),
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

    return {
        id: xxh64(`${trimmedOrganizer}-${trimmedEvent}`, 123n).toString(16),
        organizer: trimmedOrganizer, // deprecated in favor of host
        host: getHostDetails(trimmedOrganizer),
        title: trimmedEvent,
        titles: {
            de: trimmedEvent,
            en: trimmedEvent,
        },
        begin: details.Start ? parseLocalDateTime(details.Start) : null,
        startDateTime: details.Start ? parseLocalDateTime(details.Start) : null,
        end: details.Ende ? parseLocalDateTime(details.Ende) : null,
        endDateTime: details.Ende ? parseLocalDateTime(details.Ende) : null,
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
    // create a fetch method that keeps cookies
    const fetch = fetchCookie(nodeFetch)

    await login(fetch, username, password)

    const events = await getEvents(fetch)

    return events
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
