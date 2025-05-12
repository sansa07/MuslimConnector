import {
  users, type User, type UpsertUser,
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment,
  likes, type Like, type InsertLike,
  follows, type Follow, type InsertFollow,
  events, type Event, type InsertEvent,
  eventParticipants, type EventParticipant, type InsertEventParticipant,
  duaRequests, type DuaRequest, type InsertDuaRequest,
  duaSupports, type DuaSupport, type InsertDuaSupport,
  quranVerses, type QuranVerse,
  hadiths, type Hadith
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserWarningCount(id: string, increment: boolean): Promise<User | undefined>;
  banUser(id: string, reason: string): Promise<User | undefined>;
  unbanUser(id: string): Promise<User | undefined>;
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  listUsersWithRole(role: string): Promise<User[]>;
  
  // Content moderation
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  updateComment(id: number, data: Partial<Comment>): Promise<Comment | undefined>;
  getCommentById(id: number): Promise<Comment | undefined>;
  getFlaggedPosts(limit?: number, offset?: number): Promise<Post[]>;
  getFlaggedComments(limit?: number, offset?: number): Promise<Comment[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  
  // Like operations
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(postId: number, userId: string, type: string): Promise<void>;
  getLikesByPostId(postId: number): Promise<Like[]>;
  getLikeByUserAndPost(postId: number, userId: string, type: string): Promise<Like | undefined>;
  getLikesCountByPostId(postId: number): Promise<Record<string, number>>;
  
  // Follow operations
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(limit?: number, offset?: number): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  participateInEvent(participant: InsertEventParticipant): Promise<EventParticipant>;
  removeParticipation(eventId: number, userId: string): Promise<void>;
  getEventParticipants(eventId: number): Promise<User[]>;
  getParticipantCount(eventId: number): Promise<number>;
  isParticipating(eventId: number, userId: string): Promise<boolean>;
  
  // Dua Request operations
  createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest>;
  getDuaRequests(limit?: number, offset?: number): Promise<DuaRequest[]>;
  getDuaRequestById(id: number): Promise<DuaRequest | undefined>;
  supportDuaRequest(support: InsertDuaSupport): Promise<DuaSupport>;
  removeDuaSupport(duaRequestId: number, userId: string): Promise<void>;
  getDuaSupporters(duaRequestId: number): Promise<User[]>;
  getDuaSupportCount(duaRequestId: number): Promise<number>;
  isSupporting(duaRequestId: number, userId: string): Promise<boolean>;
  
  // Quran and Hadith operations
  getRandomQuranVerse(): Promise<QuranVerse | undefined>;
  getRandomHadith(): Promise<Hadith | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async updateUserWarningCount(id: string, increment: boolean): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const currentCount = user.warningCount || 0;
    const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        warningCount: newCount,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async banUser(id: string, reason: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        isBanned: true,
        banReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }
  
  async unbanUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        isBanned: false,
        banReason: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }
  
  async listUsersWithRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role));
  }
  
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset);
  }
  
  // Content moderation methods
  async updatePost(id: number, data: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set({ 
        ...data,
        updatedAt: new Date() 
      })
      .where(eq(posts.id, id))
      .returning();
    
    return post;
  }
  
  async getCommentById(id: number): Promise<Comment | undefined> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    
    return comment;
  }
  
  async updateComment(id: number, data: Partial<Comment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ 
        ...data,
        updatedAt: new Date() 
      })
      .where(eq(comments.id, id))
      .returning();
    
    return comment;
  }
  
  async getFlaggedPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.flaggedForContent, true))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getFlaggedComments(limit: number = 20, offset: number = 0): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.flaggedForContent, true))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostsByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
  }

  // Like operations
  async createLike(like: InsertLike): Promise<Like> {
    const [newLike] = await db.insert(likes).values(like).returning();
    return newLike;
  }

  async deleteLike(postId: number, userId: string, type: string): Promise<void> {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, userId),
          eq(likes.type, type)
        )
      );
  }

  async getLikesByPostId(postId: number): Promise<Like[]> {
    return await db.select().from(likes).where(eq(likes.postId, postId));
  }

  async getLikeByUserAndPost(postId: number, userId: string, type: string): Promise<Like | undefined> {
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, userId),
          eq(likes.type, type)
        )
      );
    return like;
  }

  async getLikesCountByPostId(postId: number): Promise<Record<string, number>> {
    const result = await db
      .select({
        type: likes.type,
        count: sql<number>`count(*)`,
      })
      .from(likes)
      .where(eq(likes.postId, postId))
      .groupBy(likes.type);

    return result.reduce((acc, { type, count }) => {
      acc[type] = count;
      return acc;
    }, {} as Record<string, number>);
  }

  // Follow operations
  async followUser(follow: InsertFollow): Promise<Follow> {
    const [newFollow] = await db.insert(follows).values(follow).returning();
    return newFollow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }

  async getFollowers(userId: string): Promise<User[]> {
    return await db
      .select({
        ...users
      })
      .from(users)
      .innerJoin(follows, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: string): Promise<User[]> {
    return await db
      .select({
        ...users
      })
      .from(users)
      .innerJoin(follows, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    return !!follow;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvents(limit: number = 10, offset: number = 0): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(events.dateTime)
      .limit(limit)
      .offset(offset);
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async participateInEvent(participant: InsertEventParticipant): Promise<EventParticipant> {
    const [newParticipant] = await db.insert(eventParticipants).values(participant).returning();
    return newParticipant;
  }

  async removeParticipation(eventId: number, userId: string): Promise<void> {
    await db
      .delete(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      );
  }

  async getEventParticipants(eventId: number): Promise<User[]> {
    return await db
      .select({
        ...users
      })
      .from(users)
      .innerJoin(eventParticipants, eq(eventParticipants.userId, users.id))
      .where(eq(eventParticipants.eventId, eventId));
  }

  async getParticipantCount(eventId: number): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId));
    
    return result[0].count;
  }

  async isParticipating(eventId: number, userId: string): Promise<boolean> {
    const [participant] = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      );
    return !!participant;
  }

  // Dua Request operations
  async createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest> {
    const [newDuaRequest] = await db.insert(duaRequests).values(duaRequest).returning();
    return newDuaRequest;
  }

  async getDuaRequests(limit: number = 10, offset: number = 0): Promise<DuaRequest[]> {
    return await db
      .select()
      .from(duaRequests)
      .orderBy(desc(duaRequests.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getDuaRequestById(id: number): Promise<DuaRequest | undefined> {
    const [duaRequest] = await db.select().from(duaRequests).where(eq(duaRequests.id, id));
    return duaRequest;
  }

  async supportDuaRequest(support: InsertDuaSupport): Promise<DuaSupport> {
    const [newSupport] = await db.insert(duaSupports).values(support).returning();
    return newSupport;
  }

  async removeDuaSupport(duaRequestId: number, userId: string): Promise<void> {
    await db
      .delete(duaSupports)
      .where(
        and(
          eq(duaSupports.duaRequestId, duaRequestId),
          eq(duaSupports.userId, userId)
        )
      );
  }

  async getDuaSupporters(duaRequestId: number): Promise<User[]> {
    return await db
      .select({
        ...users
      })
      .from(users)
      .innerJoin(duaSupports, eq(duaSupports.userId, users.id))
      .where(eq(duaSupports.duaRequestId, duaRequestId));
  }

  async getDuaSupportCount(duaRequestId: number): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(duaSupports)
      .where(eq(duaSupports.duaRequestId, duaRequestId));
    
    return result[0].count;
  }

  async isSupporting(duaRequestId: number, userId: string): Promise<boolean> {
    const [support] = await db
      .select()
      .from(duaSupports)
      .where(
        and(
          eq(duaSupports.duaRequestId, duaRequestId),
          eq(duaSupports.userId, userId)
        )
      );
    return !!support;
  }

  // Quran and Hadith operations
  async getRandomQuranVerse(): Promise<QuranVerse | undefined> {
    const [verse] = await db
      .select()
      .from(quranVerses)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return verse;
  }

  async getRandomHadith(): Promise<Hadith | undefined> {
    const [hadith] = await db
      .select()
      .from(hadiths)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return hadith;
  }
}

export const storage = new DatabaseStorage();
