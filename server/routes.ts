import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getPrayerTimes } from "./api/prayer";
import { 
  getDailyVerseForDay, 
  getDailyHadithForDay, 
  getDailyDuaForDay, 
  getDailyStoryForDay,
  getCurrentDayOfYear
} from "./api/daily-wisdom";
import { quranVerses, hadiths } from "@shared/schema";
import { insertPostSchema, insertCommentSchema, insertLikeSchema, insertEventSchema, insertDuaRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Prayer times API
  app.get('/api/prayer-times', async (req, res) => {
    try {
      const city = req.query.city as string || 'istanbul';
      const prayerTimes = await getPrayerTimes(city);
      res.json(prayerTimes);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      res.status(500).json({ message: 'Failed to fetch prayer times' });
    }
  });

  // Verse of the day API
  app.get('/api/daily-verse', async (req, res) => {
    try {
      const verse = await storage.getRandomQuranVerse();
      if (!verse) {
        return res.status(404).json({ message: 'No verse found' });
      }
      res.json(verse);
    } catch (error) {
      console.error('Error fetching daily verse:', error);
      res.status(500).json({ message: 'Failed to fetch daily verse' });
    }
  });

  // Random hadith API
  app.get('/api/random-hadith', async (req, res) => {
    try {
      const hadith = await storage.getRandomHadith();
      if (!hadith) {
        return res.status(404).json({ message: 'No hadith found' });
      }
      res.json(hadith);
    } catch (error) {
      console.error('Error fetching random hadith:', error);
      res.status(500).json({ message: 'Failed to fetch random hadith' });
    }
  });
  
  // Daily verse of the day API - using date-based selection
  app.get('/api/daily-verse', async (req, res) => {
    try {
      const dayOfYear = getCurrentDayOfYear();
      const verse = await getDailyVerseForDay(dayOfYear);
      res.json(verse);
    } catch (error) {
      console.error('Error fetching daily verse:', error);
      res.status(500).json({ message: 'Failed to fetch daily verse' });
    }
  });

  // Daily hadith API - using date-based selection
  app.get('/api/daily-hadith', async (req, res) => {
    try {
      const dayOfYear = getCurrentDayOfYear();
      const hadith = await getDailyHadithForDay(dayOfYear);
      res.json(hadith);
    } catch (error) {
      console.error('Error fetching daily hadith:', error);
      res.status(500).json({ message: 'Failed to fetch daily hadith' });
    }
  });
  
  // Daily dua API - using date-based selection
  app.get('/api/daily-dua', async (req, res) => {
    try {
      const dayOfYear = getCurrentDayOfYear();
      const dua = await getDailyDuaForDay(dayOfYear);
      res.json(dua);
    } catch (error) {
      console.error('Error fetching daily dua:', error);
      res.status(500).json({ message: 'Failed to fetch daily dua' });
    }
  });
  
  // Daily story API - using date-based selection
  app.get('/api/daily-story', async (req, res) => {
    try {
      const dayOfYear = getCurrentDayOfYear();
      const story = await getDailyStoryForDay(dayOfYear);
      res.json(story);
    } catch (error) {
      console.error('Error fetching daily story:', error);
      res.status(500).json({ message: 'Failed to fetch daily story' });
    }
  });

  // Posts API
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid post data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create post' });
      }
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ message: 'Failed to fetch post' });
    }
  });

  // Comments API
  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  });

  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const validatedData = insertCommentSchema.parse({ ...req.body, postId, userId });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid comment data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create comment' });
      }
    }
  });

  // Likes API
  app.get('/api/posts/:id/likes', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const likesCount = await storage.getLikesCountByPostId(postId);
      res.json(likesCount);
    } catch (error) {
      console.error('Error fetching likes:', error);
      res.status(500).json({ message: 'Failed to fetch likes' });
    }
  });

  app.post('/api/posts/:id/likes', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const validatedData = insertLikeSchema.parse({ ...req.body, postId, userId });
      
      // Check if the user already liked this post with this type
      const existingLike = await storage.getLikeByUserAndPost(postId, userId, validatedData.type);
      
      if (existingLike) {
        // If exists, remove it (toggle)
        await storage.deleteLike(postId, userId, validatedData.type);
        res.status(200).json({ message: 'Like removed' });
      } else {
        // Otherwise, create it
        const like = await storage.createLike(validatedData);
        res.status(201).json(like);
      }
    } catch (error) {
      console.error('Error processing like:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid like data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to process like' });
      }
    }
  });

  // Events API
  app.get('/api/events', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const events = await storage.getEvents(limit, offset);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEventSchema.parse({ ...req.body, userId });
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid event data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create event' });
      }
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  });

  app.post('/api/events/:id/participate', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if already participating
      const isParticipating = await storage.isParticipating(eventId, userId);
      
      if (isParticipating) {
        // Remove participation
        await storage.removeParticipation(eventId, userId);
        res.status(200).json({ message: 'Participation removed' });
      } else {
        // Add participation
        const participant = await storage.participateInEvent({ eventId, userId });
        res.status(201).json(participant);
      }
    } catch (error) {
      console.error('Error processing event participation:', error);
      res.status(500).json({ message: 'Failed to process event participation' });
    }
  });

  app.get('/api/events/:id/participants/count', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const count = await storage.getParticipantCount(eventId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching participant count:', error);
      res.status(500).json({ message: 'Failed to fetch participant count' });
    }
  });

  // Dua Requests API
  app.get('/api/dua-requests', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const duaRequests = await storage.getDuaRequests(limit, offset);
      res.json(duaRequests);
    } catch (error) {
      console.error('Error fetching dua requests:', error);
      res.status(500).json({ message: 'Failed to fetch dua requests' });
    }
  });

  app.post('/api/dua-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDuaRequestSchema.parse({ ...req.body, userId });
      const duaRequest = await storage.createDuaRequest(validatedData);
      res.status(201).json(duaRequest);
    } catch (error) {
      console.error('Error creating dua request:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid dua request data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create dua request' });
      }
    }
  });

  app.get('/api/dua-requests/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const duaRequest = await storage.getDuaRequestById(id);
      if (!duaRequest) {
        return res.status(404).json({ message: 'Dua request not found' });
      }
      res.json(duaRequest);
    } catch (error) {
      console.error('Error fetching dua request:', error);
      res.status(500).json({ message: 'Failed to fetch dua request' });
    }
  });

  app.post('/api/dua-requests/:id/support', isAuthenticated, async (req: any, res) => {
    try {
      const duaRequestId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if already supporting
      const isSupporting = await storage.isSupporting(duaRequestId, userId);
      
      if (isSupporting) {
        // Remove support
        await storage.removeDuaSupport(duaRequestId, userId);
        res.status(200).json({ message: 'Support removed' });
      } else {
        // Add support
        const support = await storage.supportDuaRequest({ duaRequestId, userId });
        res.status(201).json(support);
      }
    } catch (error) {
      console.error('Error processing dua support:', error);
      res.status(500).json({ message: 'Failed to process dua support' });
    }
  });

  app.get('/api/dua-requests/:id/supporters/count', async (req, res) => {
    try {
      const duaRequestId = parseInt(req.params.id);
      const count = await storage.getDuaSupportCount(duaRequestId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching supporter count:', error);
      res.status(500).json({ message: 'Failed to fetch supporter count' });
    }
  });

  // User profile API
  app.get('/api/users/:id/posts', async (req, res) => {
    try {
      const userId = req.params.id;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPostsByUserId(userId, limit, offset);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ message: 'Failed to fetch user posts' });
    }
  });

  app.get('/api/users/:id/followers', async (req, res) => {
    try {
      const userId = req.params.id;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
      res.status(500).json({ message: 'Failed to fetch followers' });
    }
  });

  app.get('/api/users/:id/following', async (req, res) => {
    try {
      const userId = req.params.id;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error('Error fetching following:', error);
      res.status(500).json({ message: 'Failed to fetch following' });
    }
  });

  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followingId = req.params.id;
      const followerId = req.user.claims.sub;
      
      // Cannot follow yourself
      if (followerId === followingId) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }
      
      // Check if already following
      const isFollowing = await storage.isFollowing(followerId, followingId);
      
      if (isFollowing) {
        // Unfollow
        await storage.unfollowUser(followerId, followingId);
        res.status(200).json({ message: 'Unfollowed successfully' });
      } else {
        // Follow
        const follow = await storage.followUser({ followerId, followingId });
        res.status(201).json(follow);
      }
    } catch (error) {
      console.error('Error processing follow:', error);
      res.status(500).json({ message: 'Failed to process follow' });
    }
  });

  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.updateUserProfile(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
