import cuid2 from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * We are using cuid2 for generating ids
 * - 21 characters
 * - sorted lexicographically
 * - URL friendly
 */
const defaultCuid = cuid2.init({ length: 21 })

const primaryKey = (name = 'id') =>
  text(name)
    .$default(() => defaultCuid())
    .primaryKey()

export const userTable = pgTable('user', {
  id: primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type SelectUser = typeof userTable.$inferSelect
export type InsertUser = typeof userTable.$inferInsert

export const userRelations = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
  emailVerifications: many(emailVerificationTable),
  oauthAccounts: many(oauthAccountsTable),
}))

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type SelectSession = typeof sessionTable.$inferSelect
export type InsertSession = typeof sessionTable.$inferInsert

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}))

export const emailVerificationTable = pgTable('email_verification', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  email: text('email').notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type SelectEmailVerification = typeof emailVerificationTable.$inferSelect
export type InsertEmailVerification = typeof emailVerificationTable.$inferInsert

export const emailVerificationRelations = relations(emailVerificationTable, ({ one }) => ({
  user: one(userTable, {
    fields: [emailVerificationTable.userId],
    references: [userTable.id],
  }),
}))

export const oauthAccountsTable = pgTable('oauth_accounts', {
  id: primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SelectOAuthAccount = typeof oauthAccountsTable.$inferSelect
export type InsertOAuthAccount = typeof oauthAccountsTable.$inferInsert
