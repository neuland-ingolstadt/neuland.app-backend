/**
 * @file Fetches career service events from the Handshake RSS feed.
 */
import { GraphQLError } from 'graphql'
import moment from 'moment-timezone'
import xmljs from 'xml-js'

const RSS_URL =
    'https://app.joinhandshake.de/external_feeds/280/public.rss?token=4EC5IbcjruYYmuRhEjJXvWduZer9aAoFVw3VsEXMAQglWtA_UoBECQ'

function parseDateFromTitle(title: string): Date | null {
    // Extract date pattern from title (e.g., "Donnerstag, 9. Oktober 2025, 08:00 - 18:00 CEST")
    const match = title.match(
        /(\w+),\s+(\d+)\.\s+(\w+)\s+(\d+),\s+(\d+):(\d+)\s+-\s+(\d+):(\d+)\s+(CEST|CET)/
    )

    if (!match) {
        return null
    }

    const [, , day, monthStr, year, startHour, startMinute] = match

    const months: { [key: string]: number } = {
        Januar: 0,
        Februar: 1,
        März: 2,
        April: 3,
        Mai: 4,
        Juni: 5,
        Juli: 6,
        August: 7,
        September: 8,
        Oktober: 9,
        November: 10,
        Dezember: 11,
    }

    const month = months[monthStr]
    if (month === undefined) {
        return null
    }

    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${startHour}:${startMinute}`
    const date = moment.tz(dateString, 'YYYY-MM-DD HH:mm', 'Europe/Berlin')

    return date.utc().toDate()
}

function extractCleanTitle(fullTitle: string): string {
    const match = fullTitle.match(/^(.+?)\s+\([^)]+\)$/)
    return match ? match[1].trim() : fullTitle
}

interface RssResult {
    rss: {
        channel: {
            item: Array<{
                title: { _text: string }
                description: { _text: string }
                guid: { _text: string }
                link: { _text: string }
                pubDate: { _text: string }
            }>
        }
    }
}

async function getEvents(): Promise<CareerServiceEvent[]> {
    const response = await fetch(RSS_URL)

    if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
    }

    const xmlText = await response.text()
    const result = xmljs.xml2js(xmlText, { compact: true }) as RssResult

    const channel = result?.rss?.channel
    if (!channel) {
        throw new Error('Invalid RSS feed structure')
    }

    let items = channel.item
    if (!items) {
        return []
    }
    if (!Array.isArray(items)) {
        items = [items]
    }

    const events: CareerServiceEvent[] = []

    for (const item of items) {
        const fullTitle = item.title?._text || ''
        const description = item.description?._text || ''
        const guid = item.guid?._text || ''
        const link = item.link?._text || ''
        const pubDate = item.pubDate?._text || ''

        const eventDate = parseDateFromTitle(fullTitle)
        if (!eventDate) {
            console.warn(
                `Could not parse date from title: ${fullTitle}, skipping event`
            )
            continue
        }

        const cleanTitle = extractCleanTitle(fullTitle)

        // Parse publishedDate using moment for consistency
        const publishedDate = moment(pubDate).toDate()

        events.push({
            id: guid.replace('gid://handshake/Event/', ''),
            title: cleanTitle,
            description: description,
            date: eventDate,
            url: link,
            publishedDate: publishedDate,
        })
    }

    return events
}

export default async function getCareerServiceEvents(): Promise<
    CareerServiceEvent[]
> {
    try {
        const events = await getEvents()
        return events
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
