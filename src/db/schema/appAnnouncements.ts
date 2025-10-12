import {
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp
} from 'drizzle-orm/pg-core'

export const appPlatformEnum = pgEnum('app_platform', [
    'ANDROID',
    'IOS',
    'WEB',
    'WEB_DEV'
])
export const userKindEnum = pgEnum('user_kind', [
    'STUDENT',
    'EMPLOYEE',
    'GUEST'
])
export const appAnnouncements = pgTable('app_announcements', {
    id: serial('id').primaryKey(),
    platform: appPlatformEnum('platform').array().notNull(),
    user_kind: userKindEnum('user_kind').array().notNull(),
    title_de: text('title_de').notNull(),
    title_en: text('title_en').notNull(),
    description_de: text('description_de').notNull(),
    description_en: text('description_en').notNull(),
    start_date_time: timestamp('start_date_time', {
        withTimezone: true
    }).notNull(),
    end_date_time: timestamp('end_date_time', { withTimezone: true }).notNull(),
    priority: integer('priority').notNull(),
    url: text('url'),
    image_url: text('image_url'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull()
})
