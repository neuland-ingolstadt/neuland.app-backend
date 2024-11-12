/**
 * @file Scrapes events from the `Campus Life` Moodle course and serves them at `/api/events`.
 */
import clubsData from '@/data/clubs.json'
import type { ClEvent, ClHost } from '@/types/clEvents'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import fetchCookie, { type FetchCookieImpl } from 'fetch-cookie'
import fs from 'fs/promises'
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
const EVENT_LIST_URL = 'https://moodle.thi.de/mod/dataform/view.php?id=162869'
const EVENT_DETAILS_PREFIX = 'https://moodle.thi.de/mod/dataform/view.php'
const EVENT_STORE = `${Bun.env.STORE}/cl-events.json`
const isDev = Bun.env.NODE_ENV !== 'production'

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
    const [, day, month, year, hour, minute] = match ?? []
    const typedMonth = month as Month
    if (
        day.length === 0 ||
        month.length === 0 ||
        year.length === 0 ||
        hour.length === 0 ||
        minute.length === 0
    ) {
        throw new Error('Invalid date string')
    }

    // Create a date string and parse it in the Europe/Berlin time zone
    const dateString = `${day}-${MONTHS[typedMonth]}-${year} ${hour}:${minute}`
    const date = moment.tz(dateString, 'D-M-YYYY H:mm', 'Europe/Berlin')

    // Convert to UTC and return a JavaScript Date
    return date.utc().toDate()
}
/**
 * Load persisted events from disk.
 */
async function loadEvents(): Promise<ClEvent[]> {
    const fileHandle = await fs.open(EVENT_STORE, 'a+')
    const data = await fileHandle.readFile()
    const fileContent = data.toString()
    await fileHandle.close()
    if (fileContent.length === 0) {
        return []
    }
    return JSON.parse(data.toString()).map((event: ClEvent) => ({
        ...event,
        begin: event.begin == null ? null : new Date(event.begin),
        end: event.end == null ? null : new Date(event.end),
    }))
}

/**
 * Persist events to disk.
 * @param {object[]} events
 */
async function saveEvents(events: ClEvent[]): Promise<void> {
    await fs.writeFile(EVENT_STORE, JSON.stringify(events))
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
async function getEventList(
    fetch: FetchCookieImpl<
        nodeFetch.RequestInfo,
        nodeFetch.RequestInit,
        nodeFetch.Response
    >
): Promise<string[]> {
    const resp: nodeFetch.Response = await fetch(EVENT_LIST_URL)
    const $ = cheerio.load(await resp.text())

    // get links from content table
    const links = $('.entriesview a.menu-action').get()
    // extract href attributes
    return links
        .map((elem) => $(elem).attr('href'))
        .filter((href): href is string => !(href == null))
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
): Promise<Record<string, string>> {
    if (!url.startsWith(EVENT_DETAILS_PREFIX)) {
        throw new Error('Invalid URL')
    }

    const resp: nodeFetch.Response = await fetch(url)
    const $ = cheerio.load(await resp.text())
    const rows = $('.entry tr:not(.lastrow)').get()

    return Object.fromEntries(
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
}

function getHostDetails(host: string): ClHost {
    const trimmed = host
        .trim()
        .replace(/( \.)$/g, '')
        .replace(/e\. V\./g, 'e.V.')
    const club = clubsData.find((club) => club.club === trimmed)
    if (club == null) {
        return {
            name: trimmed,
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
    const now = new Date()
    let events = !isDev ? await loadEvents() : []

    // create a fetch method that keeps cookies
    const fetch = fetchCookie(nodeFetch)

    await login(fetch, username, password)

    const remoteEvents: ClEvent[] = []
    for (const url of await getEventList(fetch)) {
        const details = await getEventDetails(fetch, url)
        const publicKey = 'Veröffentlichung des Ortes & Bescheibung in Apps' // sic (see Moodle)
        const publicEvent = details[publicKey] === 'Ja'

        remoteEvents.push({
            id: crypto.createHash('sha256').update(url).digest('hex'),
            organizer: details.Verein.trim()
                .replace(/( \.)$/g, '')
                .replace(/e\. V\./g, 'e.V.'),
            host: getHostDetails(details.Verein),
            title: details.Event,
            begin:
                details.Start.length > 0
                    ? parseLocalDateTime(details.Start)
                    : null,
            end:
                details.Ende.length > 0
                    ? parseLocalDateTime(details.Ende)
                    : null,
            location: publicEvent ? details.Ort : null,
            description: publicEvent ? details.Beschreibung : null,
        })
    }

    if (remoteEvents.length > 0) {
        // remove all events which disappeared from the server
        // this will not work if the first event gets removed
        const remoteStart = remoteEvents
            .map((event) => event.begin)
            .reduce((a, b) => ((a ?? 0) < (b ?? 0) ? a : b))
        events = events
            .filter((a) => (a.begin ?? 0) < (remoteStart ?? 0))
            .concat(remoteEvents)
    }

    events = events.filter(
        (event) =>
            (event.begin != null && new Date(event.begin) > now) ||
            (event.end != null && new Date(event.end) > now)
    )
    events = events
        .sort((a, b) => (a.end?.getTime() ?? 0) - (b.end?.getTime() ?? 0))
        .sort((a, b) => (a.begin?.getTime() ?? 0) - (b.begin?.getTime() ?? 0))
    // we need to persist the events because they disappear on monday
    // even if the event has not passed yet
    if (!isDev) {
        await saveEvents(events)
    }

    return events
}

export default async function getClEvents(): Promise<ClEvent[]> {
    try {
        const username = Bun.env.MOODLE_USERNAME
        const password = Bun.env.MOODLE_PASSWORD

        if (username != null && password != null) {
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
