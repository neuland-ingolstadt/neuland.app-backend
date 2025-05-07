/**
 * @file Scrapes events from the `Campus Life` Moodle course and serves them at `/api/events`.
 */
import { MONTHS, type Month } from '@/utils/moodle-utils'
import { xxh64 } from '@node-rs/xxhash'
import * as cheerio from 'cheerio'
import fetchCookie, { type FetchCookieImpl } from 'fetch-cookie'
import { GraphQLError } from 'graphql'
import moment from 'moment'
import nodeFetch from 'node-fetch'

const LOGIN_URL = 'https://moodle.thi.de/login/index.php'
const LIST_URL = 'https://moodle.thi.de/mod/booking/view.php?id=85612'

/**
 * Parses a date like "1. Juli 2025, 16:00 - 18:00".
 * @param {string} str
 * @returns {Date}
 */
function parseLocalDateTime(str: string): Date {
    const match = str.match(
        /(\d+)\. (\p{Letter}+) (\d+), (\d+):(\d+) - (\d+):(\d+)/u
    )
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
 * Fetch a list of event details.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 * @returns {CareerServiceEvent[]}
 */
async function getEvents(
    fetch: FetchCookieImpl<
        nodeFetch.RequestInfo,
        nodeFetch.RequestInit,
        nodeFetch.Response
    >
): Promise<CareerServiceEvent[]> {
    const data: CareerServiceEvent[] = []
    const page = await fetch(LIST_URL)

    const text = await page.text()
    const $ = cheerio.load(text)

    // Select all rows except empty ones
    const rows = $('tr:not(.emptyrow)')

    rows.each((_index, row) => {
        const title = $(row).find('h5').text().trim()
        const date = $(row).find('.collapse div').text().trim()
        const availableSlotsText = $(row)
            .find('.col-ap-availableplaces')
            .text()
            .trim()
        const waitingListText = $(row)
            .find('.col-ap-waitingplacesavailable')
            .text()
            .trim()

        // Extract available and waiting places numbers
        const availableSlotsMatch = availableSlotsText.match(/(\d+) von (\d+)/)
        const waitingListMatch = waitingListText.match(/(\d+) von (\d+)/)

        const availableSlots = availableSlotsMatch
            ? parseInt(availableSlotsMatch[1], 10)
            : null
        const totalSlots = availableSlotsMatch
            ? parseInt(availableSlotsMatch[2], 10)
            : null
        const waitingList = waitingListMatch
            ? parseInt(waitingListMatch[1], 10)
            : null
        const maxWaitingList = waitingListMatch
            ? parseInt(waitingListMatch[2], 10)
            : null

        // Add event to data
        if (title && date) {
            data.push({
                id: xxh64(title + date).toString(),
                title,
                date: parseLocalDateTime(date),
                availableSlots,
                totalSlots,
                waitingList,
                maxWaitingList,
                // For now, just use the same URL for all events
                url: LIST_URL,
            })
        }
    })

    return data.reverse() // Reverse to maintain future-to-past order
}

/**
 * Fetches all event details from Moodle.
 * @param {string} username
 * @param {string} password
 */
export async function getAllEventDetails(
    username: string,
    password: string
): Promise<CareerServiceEvent[]> {
    const fetch = fetchCookie(nodeFetch)

    await login(fetch, username, password)

    return getEvents(fetch)
}

export default async function getCareerServiceEvents(): Promise<
    CareerServiceEvent[]
> {
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
