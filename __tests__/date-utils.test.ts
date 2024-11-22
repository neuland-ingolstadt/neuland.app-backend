import { describe, expect, it } from 'vitest'

import {
    addWeek,
    formatISODate,
    getDays,
    getMonday,
    getWeek,
    isoToPostgres,
} from '../src/utils/date-utils'

describe('date-utils', () => {
    describe('formatISODate', () => {
        it('should format a date to ISO string', () => {
            const date = new Date('2020-10-01')
            expect(formatISODate(date)).toBe('2020-10-01')
        })

        it('should return an empty string for undefined date', () => {
            expect(formatISODate(undefined)).toBe('')
        })
    })

    describe('getMonday', () => {
        it('should return the start of the week for a given date', () => {
            const date = new Date('2024-11-22') // Friday
            const monday = getMonday(date)
            expect(monday.toISOString().split('T')[0]).toBe('2024-11-18')
        })
    })

    describe('getWeek', () => {
        it('should return the start and end of the week for a given date', () => {
            const date = new Date('2020-10-07') // Wednesday
            const [start, end] = getWeek(date)
            expect(start.toISOString().split('T')[0]).toBe('2020-10-05')
            expect(end.toISOString().split('T')[0]).toBe('2020-10-12')
        })
    })

    describe('getDays', () => {
        it('should return all days between two dates', () => {
            const begin = new Date('2020-10-01')
            const end = new Date('2020-10-05')
            const days = getDays(begin, end)
            expect(days.map((d) => d.toISOString().split('T')[0])).toEqual([
                '2020-10-01',
                '2020-10-02',
                '2020-10-03',
                '2020-10-04',
            ])
        })
    })

    describe('addWeek', () => {
        it('should add weeks to a date', () => {
            const date = new Date('2020-10-01')
            const newDate = addWeek(date, 2)
            expect(newDate.toISOString().split('T')[0]).toBe('2020-10-15')
        })
    })

    describe('isoToPostgres', () => {
        it('should convert ISO date string to Postgres date string', () => {
            const isoDate = new Date('2020-10-01T00:00:00Z').getTime()
            expect(isoToPostgres(isoDate)).toBe('2020-10-01 00:00:00.000')
        })
    })
})
