import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const manualClEvents = pgTable('manual_cl_events', {
  id: serial('id').primaryKey(),
  title_de: text('title_de').notNull(),
  title_en: text('title_en').notNull(),
  description_de: text('description_de'),
  description_en: text('description_en'),
  start_date_time: timestamp('start_date_time', {
    withTimezone: true
  }).notNull(),
  end_date_time: timestamp('end_date_time', { withTimezone: true }),
  organizer: text('organizer').notNull(),
  location: text('location'),
  host_url: text('url'),
  host_instagram: text('instagram'),
  event_url: text('event_url'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull()
})
