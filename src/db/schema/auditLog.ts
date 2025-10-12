import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  entity: text('entity').notNull(),
  entity_id: integer('entity_id'),
  operation: text('operation').notNull(),
  name: text('name'),
  user_id: text('user_id'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull()
})
