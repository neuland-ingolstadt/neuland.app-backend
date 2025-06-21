import { index, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const neulandEvents = pgTable(
    'neulandEvents',
    {
        id: serial('id').primaryKey(),
        title_de: text('title_de').notNull(),
        title_en: text('title_en').notNull(),
        description_de: text('description_de'),
        description_en: text('description_en'),
        location: text('location'),
        created_at: timestamp('created_at', {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true }),
        created_by_email: text('created_by_email'),
        updated_by_email: text('updated_by_email'),
        start_time: timestamp('start_time', { withTimezone: true }),
        end_time: timestamp('end_time', { withTimezone: true }),
        rrule: text('rrule'),
    },
    (table) => [index('idx_events_start_time').on(table.start_time)]
)
