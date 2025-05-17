/**
 * @file Scrapes events from the `Campus Life` Moodle course and serves them at `/api/events`.
 */
import { login, parseLocalDateTimeDuration } from '@/utils/moodle-utils'
import { xxh64 } from '@node-rs/xxhash'
import * as cheerio from 'cheerio'
import fetchCookie, { type FetchCookieImpl } from 'fetch-cookie'
import { GraphQLError } from 'graphql'
import nodeFetch from 'node-fetch'

const LIST_URL = 'https://moodle.thi.de/mod/booking/view.php?id=86853'

/**
 * Fetch a list of event details.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 * @returns {StudentAdvisoryEvent[]}
 */
async function getEvents(
    fetch: FetchCookieImpl<
        nodeFetch.RequestInfo,
        nodeFetch.RequestInit,
        nodeFetch.Response
    >
): Promise<StudentAdvisoryEvent[]> {
    const data: StudentAdvisoryEvent[] = []
    const page = await fetch(LIST_URL)

    const text = await page.text()
    const $ = cheerio.load(text)

    // Select all rows except empty ones
    const rows = $('tr:not(.emptyrow)')

    rows.each((_index, row) => {
        const title = $(row).find('h5').text().trim()
        const date = $(row).find('.collapse div').text().trim()

        const unlimitedSlotsText = $(row)
            .find('.col-ap-unlimited')
            .text()
            .trim()

        const unlimitedSlots = unlimitedSlotsText.toLowerCase() === 'unbegrenzt'

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
                date: parseLocalDateTimeDuration(date),
                unlimitedSlots,
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
): Promise<StudentAdvisoryEvent[]> {
    const fetch = fetchCookie(nodeFetch)

    await login(fetch, username, password)

    return getEvents(fetch)
}

export default async function getStudentAdvisoryEvents(): Promise<
    StudentAdvisoryEvent[]
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
