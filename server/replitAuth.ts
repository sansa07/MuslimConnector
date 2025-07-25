import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
// Memory store yerine Pg store kullanıyoruz
import MemoryStore from "memorystore";
import { storage } from "./storage";

// Check if Replit authentication is available
const isReplitAuthAvailable = !!(process.env.REPLIT_DOMAINS && process.env.REPL_ID);

if (!isReplitAuthAvailable) {
  console.warn("REPLIT_DOMAINS or REPL_ID environment variables not provided. Replit authentication will be disabled.");
}

const getOidcConfig = memoize(
  async () => {
    if (!isReplitAuthAvailable) {
      throw new Error("Replit authentication not available");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // PostgreSQL bağlantı hatası nedeniyle memory store kullanıyoruz
  const MemoryStoreClass = MemoryStore(session);
  const sessionStore = new MemoryStoreClass({
    checkPeriod: 86400000 // 24 saatte bir kontrol et
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'muslim-net-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // development ortamında false olarak ayarlandı
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  try {
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  } catch (error) {
    console.error("Kullanıcı güncelleme hatası:", error);
    // Hata durumunda sessizce devam et
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only setup Replit authentication if environment variables are available
  if (!isReplitAuthAvailable) {
    console.log("Replit authentication disabled - environment variables not available");
    
    // Setup fallback routes that redirect to regular auth
    app.get("/api/login", (req, res) => {
      res.redirect("/auth");
    });

    app.get("/api/callback", (req, res) => {
      res.redirect("/auth");
    });

    app.get("/api/logout", (req, res) => {
      try {
        // HTML sayfası döndür - localStorage'ı temizlesin ve login sayfasına yönlendirsin
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Çıkış yapılıyor...</title>
              <script>
                // LocalStorage'dan kullanıcı verisini temizle
                localStorage.removeItem('userData');
                
                // 1 saniye sonra giriş sayfasına yönlendir
                setTimeout(function() {
                  window.location.href = '/auth';
                }, 1000);
              </script>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background-color: #f5f5f5;
                }
                .logout-container {
                  text-align: center;
                  padding: 20px;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <div class="logout-container">
                <h2>Çıkış Yapılıyor</h2>
                <p>Güvenli bir şekilde çıkış yapılıyor, lütfen bekleyin...</p>
              </div>
            </body>
          </html>
        `);
        
        // Oturumu da kapat
        req.logout(() => {
          console.log("Oturum başarıyla kapatıldı");
        });
      } catch (error) {
        console.error("Logout error:", error);
        res.redirect("/auth");
      }
    });

    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user = {} as any; // TypeScript hatasını çözmek için tip tanımlaması
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    } catch (error) {
      console.error("Doğrulama hatası:", error);
      verified(error as Error);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    try {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
      res.redirect("/");
    }
  });

  app.get("/api/callback", (req, res, next) => {
    try {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/",
      })(req, res, next);
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect("/");
    }
  });

  app.get("/api/logout", (req, res) => {
    try {
      // HTML sayfası döndür - localStorage'ı temizlesin ve login sayfasına yönlendirsin
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Çıkış yapılıyor...</title>
            <script>
              // LocalStorage'dan kullanıcı verisini temizle
              localStorage.removeItem('userData');
              
              // 1 saniye sonra giriş sayfasına yönlendir
              setTimeout(function() {
                window.location.href = '/auth';
              }, 1000);
            </script>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .logout-container {
                text-align: center;
                padding: 20px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
            </style>
          </head>
          <body>
            <div class="logout-container">
              <h2>Çıkış Yapılıyor</h2>
              <p>Güvenli bir şekilde çıkış yapılıyor, lütfen bekleyin...</p>
            </div>
          </body>
        </html>
      `);
      
      // Oturumu da kapat
      req.logout(() => {
        // HTML sayfası döndürdüğümüz için burada yönlendirme yapmıyoruz
        console.log("Oturum başarıyla kapatıldı");
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.redirect("/auth");
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // If Replit auth is not available, skip authentication check
  if (!isReplitAuthAvailable) {
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};