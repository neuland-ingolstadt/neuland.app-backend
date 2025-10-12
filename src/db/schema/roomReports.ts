import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const roomReportReason = pgEnum('room_report_reason', [
    'WRONG_DESCRIPTION',
    'WRONG_LOCATION',
    'NOT_EXISTING',
    'MISSING',
    'OTHER'
])

export const roomReports = pgTable('room_reports', {
    id: serial('id').primaryKey(),
    room: text('room').notNull(),
    reason: roomReportReason('reason').notNull(),
    description: text('description').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull(),
    resolved_at: timestamp('resolved_at', { withTimezone: true })
})
