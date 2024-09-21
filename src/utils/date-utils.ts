/**
 * Formats a date like "2020-10-01"
 * @param {Date} date
 * @returns {string}
 */
export function formatISODate(date: Date | undefined): string {
    if (date == null) {
        return ''
    }
    const formatter = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
    const parts = formatter.formatToParts(date)
    const { year, month, day } = parts.reduce<any>(
        (allParts, part) => ({ ...allParts, [part.type]: part.value }),
        {}
    )
    return `${year}-${month}-${day}`
}
/**
 * Returns the start of the week
 * https://stackoverflow.com/a/4156516
 * @param {Date} date
 * @returns {string}
 */
export function getMonday(date: Date): Date {
    date = new Date(date)
    const day = date.getDay()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1))
    return date
}

/**
 * Returns the start and the end of the week
 * @param {Date} date
 * @returns {string}
 */
export function getWeek(date: Date): [Date, Date] {
    const start = getMonday(date)
    const end = getMonday(date)
    end.setDate(end.getDate() + 7)
    return [start, end]
}

/**
 * Returns all days between the given dates
 * @param {Date} begin
 * @param {Date} end
 * @returns {Date[]}
 */
export function getDays(begin: Date, end: Date): Date[] {
    const days = []
    const date = new Date(begin)
    // eslint-disable-next-line no-unmodified-loop-condition
    while (date < end) {
        days.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }
    return days
}

/**
 * Adds weeks to a date
 * @param {Date} date
 * @param {number} delta
 * @returns {Date}
 */
export function addWeek(date: Date, delta: number): Date {
    date = new Date(date)
    date.setDate(date.getDate() + delta * 7)
    return date
}

/**
 * Converts a iso date string to a postgres date string
 * @param {number} isoDate
 * @returns {string}
 */
export function isoToPostgres(isoDate: number): string {
    return new Date(isoDate).toISOString().replace('Z', '').replace('T', ' ')
}
