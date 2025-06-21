import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const appVersions = pgTable('app_versions', {
    id: serial('id').primaryKey(),
    warning_version: text('warning_version').notNull(),
    deprecated_version: text('deprecated_version').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull(),
})
