import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    time,
    timestamp,
} from 'drizzle-orm/pg-core'

export const campusEnum = pgEnum('campus', ['Ingolstadt', 'Neuburg'])
export const weekdayEnum = pgEnum('weekday', [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
])

export const universitySports = pgTable('university_sports', {
    id: serial('id').primaryKey(),
    title_de: text('title_de').notNull(),
    description_de: text('description_de'),
    title_en: text('title_en').notNull(),
    description_en: text('description_en'),
    campus: campusEnum('campus').notNull(),
    location: text('location').notNull(),
    weekday: weekdayEnum('weekday').notNull(),
    start_time: time('start_time').notNull(),
    end_time: time('end_time'),
    requires_registration: boolean('requires_registration').notNull(),
    invitation_link: text('invitation_link'),
    e_mail: text('e_mail'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export type DbUniversitySport = typeof universitySports.$inferSelect
export type DbUniversitySportInsert = typeof universitySports.$inferInsert

export const appAnnouncements = pgTable('app_announcements', {
    id: serial('id').primaryKey(),
    title_de: text('title_de').notNull(),
    title_en: text('title_en').notNull(),
    description_de: text('description_de').notNull(),
    description_en: text('description_en').notNull(),
    start_date_time: timestamp('start_date_time', {
        withTimezone: true,
    }).notNull(),
    end_date_time: timestamp('end_date_time', { withTimezone: true }).notNull(),
    priority: integer('priority').notNull(),
    url: text('url'),
})