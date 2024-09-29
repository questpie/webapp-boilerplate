import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { usersTable } from './auth.schema'

/**
 * We are keeping it like this so the SuperAdmin stuff is completely transparent to fe.
 * We don't want the users on fe to see isSuperAdmin:false in the network tab
 */
export const superAdminsTable = pgTable('super_admins', {
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updadedAt: timestamp('updated_at', { mode: 'string' })
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
})

export type SelectSuperAdmin = typeof superAdminsTable.$inferSelect
export type InsertSuperAdmin = typeof superAdminsTable.$inferInsert
export const insertSuperAdminSchema = createInsertSchema(superAdminsTable)
export const selectSuperAdminSchema = createSelectSchema(superAdminsTable)

export const superAdminsRelations = relations(superAdminsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [superAdminsTable.userId],
    references: [usersTable.id],
  }),
}))
