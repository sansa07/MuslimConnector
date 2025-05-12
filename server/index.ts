import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";

const app = express();

// CORS'u etkinleştir
app.use(cors({
  origin: true, // Tüm originlere izin ver (development için)
  credentials: true, // Cookie/session kullanımı için gerekli
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Tüm istekleri ele alacak ve özellikle API isteklerini yönlendireceğiz
  app.use((req, res, next) => {
    // URL içindeki özel karakterleri analiz et
    // Bu, Vite'ın araya girmemesi için tasarlanmış bir hacktir
    const urlParts = req.path.split('/');
    
    // Özel API isteklerini ele al
    if (req.path.includes('__auth__')) {
      console.log('Özel auth isteği yakalandı:', req.method, req.path);
      const realPath = req.path.replace('__auth__', 'api');
      req.url = realPath;
      console.log(`URL dönüştürüldü: ${req.path} -> ${realPath}`);
      res.setHeader('Content-Type', 'application/json');
    }
    
    // XHR API yönlendirmesi 
    if (req.path.startsWith('/xhr-api/')) {
      console.log('XHR isteği yakalandı:', req.method, req.path);
      const realPath = `/api${req.path.substring('/xhr-api'.length)}`;
      req.url = realPath;
      console.log(`URL dönüştürüldü: ${req.path} -> ${realPath}`);
      res.setHeader('Content-Type', 'application/json');
    }
    
    // Escape edilmiş API yönlendirmesi
    if (req.path.includes('%5F%5Fapi%5F%5F')) {
      console.log('Escape edilmiş API isteği yakalandı:', req.method, req.path);
      const realPath = req.path.replace('%5F%5Fapi%5F%5F', 'api');
      req.url = realPath;
      console.log(`URL dönüştürüldü: ${req.path} -> ${realPath}`);
      res.setHeader('Content-Type', 'application/json');
    }
    
    // Normal API isteklerini işle
    if (req.path.startsWith('/api/')) {
      // API isteği olduğunu logla
      console.log('Direkt API isteği yakalandı:', req.method, req.path);
      // İçerik türünü ayarla
      res.setHeader('Content-Type', 'application/json');
    }
    
    next();
  });

  // Tüm rotaları kaydet
  const server = await registerRoutes(app);

  // Hata yakalama middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Vite'ı sadece geliştirme ortamında ve TÜM API rotalarını kaydettikten SONRA ayarla
  // bu şekilde catch-all rotası diğer rotaları etkilemez
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
