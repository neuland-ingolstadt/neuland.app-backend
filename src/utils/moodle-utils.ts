import * as cheerio from 'cheerio'
import type { FetchCookieImpl } from 'fetch-cookie'
import { GraphQLError } from 'graphql'
import moment from 'moment-timezone'
import type { RequestInfo, RequestInit, Response } from 'node-fetch'

export const MONTHS = {
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
	Dezember: 12
} as const

export type Month = keyof typeof MONTHS

const LOGIN_URL = 'https://moodle.thi.de/login/index.php'

/**
 * Fetches a login XSRF token.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 */
async function fetchToken(
	fetch: FetchCookieImpl<RequestInfo, RequestInit, Response>
): Promise<string> {
	const resp: Response = await fetch(LOGIN_URL)
	const $ = cheerio.load(await resp.text())
	const token = $('input[name=logintoken]').val()

	if (typeof token === 'string') {
		return token
	}
	if (Array.isArray(token)) {
		return token[0]
	}
	throw new Error('Token not found')
}

/**
 * Logs into Moodle.
 * @param {object} fetch Cookie-aware implementation of `fetch`
 * @param {string} username
 * @param {string} password
 */
export async function login(
	fetch: FetchCookieImpl<RequestInfo, RequestInit, Response>,
	username: string,
	password: string
): Promise<void> {
	const data = new URLSearchParams()
	data.append('anchor', '')
	data.append('logintoken', await fetchToken(fetch))
	data.append('username', username)
	data.append('password', password)

	const resp: Response = await fetch(LOGIN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: data.toString()
	})
	const $ = cheerio.load(await resp.text())
	if ($('#loginerrormessage').length > 0) {
		throw new GraphQLError('Login failed')
	}
}

/**
 * Parses a date like "1. Juli 2025, 16:00 - 18:00".
 * @param {string} str
 * @returns {Date}
 */
export function parseLocalDateTimeDuration(str: string): Date {
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
 * Parses a date like "Donnerstag, 15. Juni 2023, 10:00".
 * @param {string} str
 * @returns {Date}
 */
export function parseLocalDateTime(str: string): Date {
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
