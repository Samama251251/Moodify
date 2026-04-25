import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const moodEntries = pgTable('mood_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  moodLevel: integer('mood_level').notNull(),
  note: text('note'),
  isDraft: boolean('is_draft').default(false),
  loggedAt: timestamp('logged_at').defaultNow(),
})

export const emotionTags = pgTable('emotion_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull().references(() => moodEntries.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
})

export const activityTags = pgTable('activity_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull().references(() => moodEntries.id, { onDelete: 'cascade' }),
  activity: text('activity').notNull(),
})

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  answers: jsonb('answers').notNull(),
  score: integer('score').notNull(),
  severityLabel: text('severity_label').notNull(),
  takenAt: timestamp('taken_at').defaultNow(),
})

export const gratitudeLogs = pgTable('gratitude_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  items: text('items').array().notNull(),
  loggedAt: timestamp('logged_at').defaultNow(),
})

export const suggestions = pgTable('suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: text('type').notNull(),
  engaged: boolean('engaged').default(false),
  helpful: boolean('helpful'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const streaks = pgTable('streaks', {
  userId: uuid('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastLoggedDate: date('last_logged_date'),
})

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  badge: text('badge').notNull(),
  awardedAt: timestamp('awarded_at').defaultNow(),
})

export const notifications = pgTable('notifications', {
  userId: uuid('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  isEnabled: boolean('is_enabled').default(false),
  scheduledTime: text('scheduled_time'),
  pushSubscription: jsonb('push_subscription'),
})

// --- Relations ---

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  moodEntries: many(moodEntries),
  assessments: many(assessments),
  gratitudeLogs: many(gratitudeLogs),
  suggestions: many(suggestions),
  streak: one(streaks),
  achievements: many(achievements),
  notification: one(notifications),
}))

export const moodEntriesRelations = relations(moodEntries, ({ one, many }) => ({
  user: one(profiles, { fields: [moodEntries.userId], references: [profiles.id] }),
  emotionTags: many(emotionTags),
  activityTags: many(activityTags),
}))

export const emotionTagsRelations = relations(emotionTags, ({ one }) => ({
  entry: one(moodEntries, { fields: [emotionTags.entryId], references: [moodEntries.id] }),
}))

export const activityTagsRelations = relations(activityTags, ({ one }) => ({
  entry: one(moodEntries, { fields: [activityTags.entryId], references: [moodEntries.id] }),
}))

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(profiles, { fields: [assessments.userId], references: [profiles.id] }),
}))

export const gratitudeLogsRelations = relations(gratitudeLogs, ({ one }) => ({
  user: one(profiles, { fields: [gratitudeLogs.userId], references: [profiles.id] }),
}))

export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  user: one(profiles, { fields: [suggestions.userId], references: [profiles.id] }),
}))

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(profiles, { fields: [streaks.userId], references: [profiles.id] }),
}))

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(profiles, { fields: [achievements.userId], references: [profiles.id] }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, { fields: [notifications.userId], references: [profiles.id] }),
}))
