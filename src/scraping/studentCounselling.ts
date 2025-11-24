/**
 * @file Scrapes events from the `Campus Life` Moodle course and serves them at `/api/events`.
 */

import { xxh64 } from '@node-rs/xxhash'
import * as cheerio from 'cheerio'
import fetchCookie, { type FetchCookieImpl } from 'fetch-cookie'
import nodeFetch, {
    type RequestInfo,
    type RequestInit,
    type Response
} from 'node-fetch'
import type { StudentCounsellingEvent } from '@/types/studentCounsellingEvent'
import { login, parseLocalDateTimeDuration } from '@/utils/moodle-utils'

const LIST_URL = 'https://moodle.thi.de/mod/booking/view.php?id=86853'

/**
 * Fetch a list of event details.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 * @returns {StudentCounsellingEvent[]}
 */
async function getEvents(
    fetch: FetchCookieImpl<RequestInfo, RequestInit, Response>
): Promise<StudentCounsellingEvent[]> {
    const data: StudentCounsellingEvent[] = []
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
            ? Number.parseInt(availableSlotsMatch[1], 10)
            : null
        const totalSlots = availableSlotsMatch
            ? Number.parseInt(availableSlotsMatch[2], 10)
            : null
        const waitingList = waitingListMatch
            ? Number.parseInt(waitingListMatch[1], 10)
            : null
        const maxWaitingList = waitingListMatch
            ? Number.parseInt(waitingListMatch[2], 10)
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
                url: LIST_URL
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
): Promise<StudentCounsellingEvent[]> {
    const fetch = fetchCookie(nodeFetch)

    await login(fetch, username, password)

    return getEvents(fetch)
}

export default async function getStudentCounsellingEvents(): Promise<
    StudentCounsellingEvent[]
> {
    // Source temporarily offline: return empty list to avoid repeated login attempts
    return []
}
