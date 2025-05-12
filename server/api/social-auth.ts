import { db } from "../db";
import { users } from "@shared/schema";
import { generateToken } from "./email";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { log } from "../vite";

// Facebook Auth Helpers
async function getFacebookUserData(accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch user data from Facebook");
    }
    
    return await response.json();
  } catch (error) {
    log(`Error fetching Facebook user data: ${error}`, "social-auth");
    throw error;
  }
}

// Google Auth Helpers
async function getGoogleUserData(idToken: string) {
  try {
    // Google OAuth2 API to verify token
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to verify Google token");
    }
    
    return await response.json();
  } catch (error) {
    log(`Error verifying Google token: ${error}`, "social-auth");
    throw error;
  }
}

// GitHub Auth Helpers
async function getGitHubUserData(code: string) {
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`GitHub OAuth error: ${tokenData.error_description}`);
    }
    
    // Use access token to get user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    const userData = await userResponse.json();
    
    // Get user email
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    const emails = await emailsResponse.json();
    const primaryEmail = emails.find((email: any) => email.primary)?.email || emails[0]?.email;
    
    return { ...userData, email: primaryEmail };
  } catch (error) {
    log(`Error handling GitHub authentication: ${error}`, "social-auth");
    throw error;
  }
}

// Handle Facebook login
export async function handleFacebookAuth(req: Request, res: Response) {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }
    
    const fbUserData = await getFacebookUserData(accessToken);
    
    // Check if user exists
    let [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, fbUserData.id));
    
    if (!existingUser) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: generateToken().substring(0, 16),
          username: `fb_${fbUserData.id}`,
          email: fbUserData.email,
          firstName: fbUserData.first_name,
          lastName: fbUserData.last_name,
          profileImageUrl: fbUserData.picture?.data?.url,
          role: "user",
          isActive: true,
          isVerified: true, // Facebook already verified the email
          authProvider: "facebook",
          authProviderId: fbUserData.id,
          lastLoginAt: new Date()
        })
        .returning();
      
      existingUser = newUser;
    } else {
      // Update existing user
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          profileImageUrl: fbUserData.picture?.data?.url || existingUser.profileImageUrl
        })
        .where(eq(users.id, existingUser.id));
    }
    
    // Login the user
    req.login(existingUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login error" });
      }
      
      return res.status(200).json(existingUser);
    });
  } catch (error) {
    log(`Facebook auth error: ${error}`, "social-auth");
    return res.status(500).json({ error: "Authentication failed" });
  }
}

// Handle Google login
export async function handleGoogleAuth(req: Request, res: Response) {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: "ID token is required" });
    }
    
    const googleUserData = await getGoogleUserData(idToken);
    
    // Check if user exists
    let [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, googleUserData.sub));
    
    if (!existingUser) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: generateToken().substring(0, 16),
          username: `g_${googleUserData.sub}`,
          email: googleUserData.email,
          firstName: googleUserData.given_name,
          lastName: googleUserData.family_name,
          profileImageUrl: googleUserData.picture,
          role: "user",
          isActive: true,
          isVerified: googleUserData.email_verified,
          authProvider: "google",
          authProviderId: googleUserData.sub,
          lastLoginAt: new Date()
        })
        .returning();
      
      existingUser = newUser;
    } else {
      // Update existing user
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          profileImageUrl: googleUserData.picture || existingUser.profileImageUrl
        })
        .where(eq(users.id, existingUser.id));
    }
    
    // Login the user
    req.login(existingUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login error" });
      }
      
      return res.status(200).json(existingUser);
    });
  } catch (error) {
    log(`Google auth error: ${error}`, "social-auth");
    return res.status(500).json({ error: "Authentication failed" });
  }
}

// Handle GitHub login
export async function handleGitHubAuth(req: Request, res: Response) {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }
    
    const githubUserData = await getGitHubUserData(code as string);
    
    // Check if user exists
    let [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, githubUserData.id.toString()));
    
    if (!existingUser) {
      // Create new user
      // Split the name if available
      let firstName = null;
      let lastName = null;
      
      if (githubUserData.name) {
        const nameParts = githubUserData.name.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
      }
      
      const [newUser] = await db
        .insert(users)
        .values({
          id: generateToken().substring(0, 16),
          username: githubUserData.login || `gh_${githubUserData.id}`,
          email: githubUserData.email,
          firstName,
          lastName,
          profileImageUrl: githubUserData.avatar_url,
          bio: githubUserData.bio,
          role: "user",
          isActive: true,
          isVerified: true, // GitHub already verified the account
          authProvider: "github",
          authProviderId: githubUserData.id.toString(),
          lastLoginAt: new Date()
        })
        .returning();
      
      existingUser = newUser;
    } else {
      // Update existing user
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          profileImageUrl: githubUserData.avatar_url || existingUser.profileImageUrl,
          bio: githubUserData.bio || existingUser.bio
        })
        .where(eq(users.id, existingUser.id));
    }
    
    // Login the user
    req.login(existingUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login error" });
      }
      
      // Redirect to the frontend
      return res.redirect('/');
    });
  } catch (error) {
    log(`GitHub auth error: ${error}`, "social-auth");
    return res.status(500).json({ error: "Authentication failed" });
  }
}