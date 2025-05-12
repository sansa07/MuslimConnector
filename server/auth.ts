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
        usernameField: "username", // Kullanıcı adı olarak değiştirildi
        passwordField: "password"
      },
      async (username, password, done) => {
        try {
          console.log("Giriş denemesi:", username, password);
          
          // Test kullanıcı girişi
          if (username === 'admin' && password === 'admin123') {
            console.log("Test admin girişi başarılı");
            const testUser = {
              id: "1",
              username: "admin",
              email: "admin@example.com",
              password: null,
              role: "admin",
              isActive: true,
              isBanned: false,
              firstName: "Admin",
              lastName: "User",
              profileImageUrl: null,
              bio: null,
              banReason: null,
              warningCount: 0,
              verificationToken: null,
              verificationTokenExpiry: null,
              resetPasswordToken: null,
              resetPasswordTokenExpiry: null,
              authProvider: "email",
              authProviderId: null,
              lastLoginAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            return done(null, testUser);
          }
          
          // Normal kullanıcı araması
          const user = await storage.getUserByUsername(username);
          
          if (!user) {
            return done(null, false, { message: "Kullanıcı bulunamadı" });
          }
          
          // Hesap yasaklı mı kontrol et
          if (user.isBanned) {
            return done(null, false, { message: "Bu hesap yasaklanmıştır" });
          }
          
          // Hesap aktif mi kontrol et - isActive undefined olabileceği için optional chaining kullanıyoruz
          if (user.isActive === false) {
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
  // E-posta ile kayıt ol - V1 rotası
  app.post("/api/v1/register/user", async (req, res, next) => {
    try {
      console.log("Register API called with:", req.body);
      const { email, username, password, firstName, lastName } = req.body;

      // E-posta veya kullanıcı adı zaten var mı kontrol et
      const existingByEmail = await storage.getUserByEmail(email);
      if (existingByEmail) {
        console.log("Email already exists:", email);
        return res.status(400).json({ message: "Bu e-posta adresi zaten kullanılıyor" });
      }

      const existingByUsername = await storage.getUserByUsername(username);
      if (existingByUsername) {
        console.log("Username already exists:", username);
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Şifreyi hashleme
      const hashedPassword = await hashPassword(password);
      
      // Kullanıcı oluşturma zamanı
      const now = new Date();
      const userId = `email_${Date.now().toString()}`;
      
      console.log("Creating user with ID:", userId);

      // Yeni kullanıcı oluştur
      const user = await storage.createUser({
        id: userId,
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        authProvider: "email",
        role: "user",
        isActive: true,
        isBanned: false,
        warningCount: 0,
        createdAt: now,
        updatedAt: now
      });

      // Hassas bilgileri temizle
      const userResponse = { ...user };
      delete userResponse.password;

      console.log("User created successfully:", userResponse);

      // Kullanıcıyı otomatik giriş yap
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return next(err);
        }
        console.log("User logged in automatically");
        
        // JSON yanıtını düzgün formatta gönder
        const jsonResponse = JSON.stringify(userResponse);
        console.log("Sending JSON response:", jsonResponse);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).send(jsonResponse);
      });
    } catch (error) {
      console.error("Register API error:", error);
      next(error);
    }
  });
  
  // E-posta ile kayıt ol - Direkt rota
  app.post("/api/register/user", async (req, res, next) => {
    try {
      console.log("Direct Register API called with:", req.body);
      const { email, username, password, firstName, lastName } = req.body;

      // E-posta veya kullanıcı adı zaten var mı kontrol et
      const existingByEmail = await storage.getUserByEmail(email);
      if (existingByEmail) {
        console.log("Email already exists:", email);
        return res.status(400).json({ message: "Bu e-posta adresi zaten kullanılıyor" });
      }

      const existingByUsername = await storage.getUserByUsername(username);
      if (existingByUsername) {
        console.log("Username already exists:", username);
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Şifreyi hashleme
      const hashedPassword = await hashPassword(password);
      
      // Kullanıcı oluşturma zamanı
      const now = new Date();
      const userId = `email_${Date.now().toString()}`;
      
      console.log("Creating user with ID:", userId);

      // Yeni kullanıcı oluştur
      const user = await storage.createUser({
        id: userId,
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        authProvider: "email",
        role: "user",
        isActive: true,
        isBanned: false,
        warningCount: 0,
        createdAt: now,
        updatedAt: now
      });

      // Hassas bilgileri temizle
      const userResponse = { ...user };
      delete userResponse.password;

      console.log("User created successfully:", userResponse);

      // Kullanıcıyı otomatik giriş yap
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return next(err);
        }
        console.log("User logged in automatically");
        
        // JSON yanıtını düzgün formatta gönder
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error("Register API error:", error);
      next(error);
    }
  });

  // E-posta ile giriş yap - V1 rotası
  app.post("/api/v1/login", (req, res, next) => {
    console.log("API V1 Login rotası çağrıldı");
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
  
  // Direkt rotası (/api/login)
  app.post("/api/login", (req, res, next) => {
    console.log("Direkt Login rotası çağrıldı:", req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Kimlik doğrulama başarısız" });
      }
      
      // Hassas bilgileri temizle
      const userResponse = { ...user };
      if (userResponse.password) {
        delete userResponse.password;
      }

      req.login(user, (err) => {
        if (err) return next(err);
        
        // content-type header'ını ayarla
        res.setHeader('Content-Type', 'application/json');
        return res.json(userResponse);
      });
    })(req, res, next);
  });
  
  // XHR-API rotası - Vite'ı atlatmak için
  app.post("/xhr-api/login", (req, res, next) => {
    console.log("XHR-API Login rotası çağrıldı:", req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login auth error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Login failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Kimlik doğrulama başarısız" });
      }
      
      console.log("User authenticated successfully:", user.username);
      
      // Hassas bilgileri temizle
      const userResponse = { ...user };
      delete userResponse.password;

      req.login(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
          return next(err);
        }
        
        // Content-Type header'ını ayarla
        res.setHeader('Content-Type', 'application/json');
        console.log("Sending login response");
        return res.json(userResponse);
      });
    })(req, res, next);
  });
  
  // Auth hack URL - Vite'ı atlatmak için
  app.post("/__auth__/login", (req, res, next) => {
    console.log("__auth__ Login rotası çağrıldı:", req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login auth error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Login failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Kimlik doğrulama başarısız" });
      }
      
      console.log("User authenticated successfully:", user.username);
      
      // Hassas bilgileri temizle
      const userResponse = { ...user };
      delete userResponse.password;

      req.login(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
          return next(err);
        }
        
        // Content-Type header'ını ayarla
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
        console.log("Sending login response");
        return res.json(userResponse);
      });
    })(req, res, next);
  });

  // Kullanıcı bilgilerini al - V1 rotası
  app.get("/api/v1/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açılmamış" });
    }
    
    // Hassas bilgileri temizle
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json(userResponse);
  });
  
  // XHR-API rotası için özel handler
  app.get("/xhr-api/user", (req, res) => {
    console.log("XHR Kullanıcı API'ı çağrıldı");
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açılmamış" });
    }
    
    // Hassas bilgileri temizle
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.setHeader('Content-Type', 'application/json');
    res.json(userResponse);
  });
  
  // Auth hack rotası
  app.get("/__auth__/user", (req, res) => {
    console.log("__auth__ Kullanıcı API'ı çağrıldı");
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açılmamış" });
    }
    
    // Hassas bilgileri temizle
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.setHeader('Content-Type', 'application/json');
    res.json(userResponse);
  });

  // Çıkış yap - V1 rotası
  app.post("/api/v1/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  
  // Çıkış yap - Direkt rota
  app.post("/api/logout", (req, res, next) => {
    console.log("Direct Logout API called");
    req.logout((err) => {
      if (err) return next(err);
      res.setHeader('Content-Type', 'application/json');
      res.sendStatus(200);
    });
  });
}