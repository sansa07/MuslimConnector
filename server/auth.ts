import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // PostgreSQL session store kurulumu
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({ 
    pool, 
    createTableIfMissing: true,
    tableName: 'sessions' 
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "islamkomunite_gizli_anahtar",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
      secure: process.env.NODE_ENV === "production",
      httpOnly: true
    },
    store: sessionStore
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Email ve şifre doğrulama stratejisi
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          // E-posta ile kullanıcıyı bul
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: "Kullanıcı bulunamadı" });
          }
          
          // Hesap yasaklı mı kontrol et
          if (user.isBanned) {
            return done(null, false, { message: "Bu hesap yasaklanmıştır" });
          }
          
          // Hesap aktif mi kontrol et
          if (!user.isActive) {
            return done(null, false, { message: "Bu hesap etkin değil" });
          }
          
          // Şifre doğrulama
          if (user.password && await comparePasswords(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Geçersiz şifre" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Kullanıcı serileştirme/deserileştirme
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // API rotaları
  // E-posta ile kayıt ol
  app.post("/api/register/email", async (req, res, next) => {
    try {
      const { email, username, password } = req.body;

      // E-posta veya kullanıcı adı zaten var mı kontrol et
      const existingByEmail = await storage.getUserByEmail(email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Bu e-posta adresi zaten kullanılıyor" });
      }

      const existingByUsername = await storage.getUserByUsername(username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Şifreyi hashleme
      const hashedPassword = await hashPassword(password);

      // Yeni kullanıcı oluştur
      const user = await storage.createUser({
        id: `email_${Date.now().toString()}`, // Benzersiz ID
        email,
        username,
        password: hashedPassword,
        authProvider: "email",
        role: "user",
        isActive: true,
        isBanned: false,
        warningCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Hassas bilgileri temizle
      const userResponse = { ...user };
      delete userResponse.password;

      // Kullanıcıyı otomatik giriş yap
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userResponse);
      });
    } catch (error) {
      next(error);
    }
  });

  // E-posta ile giriş yap
  app.post("/api/login/email", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Kimlik doğrulama başarısız" });
      }
      
      // Hassas bilgileri temizle
      const userResponse = { ...user };
      delete userResponse.password;

      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(userResponse);
      });
    })(req, res, next);
  });

  // Kullanıcı bilgilerini al
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açılmamış" });
    }
    
    // Hassas bilgileri temizle
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json(userResponse);
  });

  // Çıkış yap
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
}