import { pgTable, text, varchar, serial, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User model
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique(),
  email: varchar("email").unique(),
  password: text("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  role: varchar("role").default("user"), // "user", "moderator", "admin"
  isActive: boolean("is_active").default(true),
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  warningCount: integer("warning_count").default(0),
  authProvider: varchar("auth_provider").default("email"), // "email", "google", "facebook", "github", "replit"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post model
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'regular', 'dua', 'ayet', 'hadith', 'event'
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isApproved: boolean("is_approved").default(true),
  isModerated: boolean("is_moderated").default(false),
  flaggedForContent: boolean("flagged_for_content").default(false),
  flagReason: text("flag_reason"),
  moderationComment: text("moderation_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true),
  isModerated: boolean("is_moderated").default(false),
  flaggedForContent: boolean("flagged_for_content").default(false),
  flagReason: text("flag_reason"),
  moderationComment: text("moderation_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Like model
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'like', 'amin', 'masallah', 'elhamdulillah'
  createdAt: timestamp("created_at").defaultNow(),
});

// Follow model
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event model
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  dateTime: timestamp("date_time").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Participants
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dua Request model
export const duaRequests = pgTable("dua_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dua Support model (for recording who prayed for a request)
export const duaSupports = pgTable("dua_supports", {
  id: serial("id").primaryKey(),
  duaRequestId: integer("dua_request_id").notNull().references(() => duaRequests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quran Verses for daily verse feature
export const quranVerses = pgTable("quran_verses", {
  id: serial("id").primaryKey(),
  surah: integer("surah").notNull(),
  ayah: integer("ayah").notNull(),
  arabicText: text("arabic_text").notNull(),
  translation: text("translation").notNull(),
  reference: text("reference").notNull(),
});

// Hadith collection
export const hadiths = pgTable("hadiths", {
  id: serial("id").primaryKey(),
  arabicText: text("arabic_text").notNull(),
  translation: text("translation").notNull(),
  source: text("source").notNull(), // e.g., Bukhari, Muslim
  reference: text("reference").notNull(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPostSchema = createInsertSchema(posts);
export const insertCommentSchema = createInsertSchema(comments);
export const insertLikeSchema = createInsertSchema(likes);
export const insertFollowSchema = createInsertSchema(follows);
export const insertEventSchema = createInsertSchema(events);
export const insertEventParticipantSchema = createInsertSchema(eventParticipants);
export const insertDuaRequestSchema = createInsertSchema(duaRequests);
export const insertDuaSupportSchema = createInsertSchema(duaSupports);
export const insertQuranVerseSchema = createInsertSchema(quranVerses);
export const insertHadithSchema = createInsertSchema(hadiths);

// Define types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = typeof eventParticipants.$inferInsert;
export type DuaRequest = typeof duaRequests.$inferSelect;
export type InsertDuaRequest = typeof duaRequests.$inferInsert;
export type DuaSupport = typeof duaSupports.$inferSelect;
export type InsertDuaSupport = typeof duaSupports.$inferInsert;
export type QuranVerse = typeof quranVerses.$inferSelect;
export type InsertQuranVerse = typeof quranVerses.$inferInsert;
export type Hadith = typeof hadiths.$inferSelect;
export type InsertHadith = typeof hadiths.$inferInsert;

// Define additional types for daily content not stored in database
export interface DailyDua {
  id: number;
  arabicText: string;
  translation: string;
  source: string;
}

export interface IslamicStory {
  id: number;
  title: string;
  content: string;
  source: string;
  reference: string;
}
