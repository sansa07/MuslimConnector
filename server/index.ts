import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
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
  // API istekleri için özel path yaratma
  // Bu "/api" yerine "/___api" gibi farklı bir path prefix kullanarak
  // Vite'ın hiç yakalamayacağı özel bir rota oluşturuyoruz
  app.use('/___api', (req, res, next) => {
    log(`Özel API rota yakalayıcısı aktif: ${req.method} ${req.path}`);
    
    // İstenen rotayı belirleyelim ve doğrudan işleyelim
    const originalPath = req.path;
    const apiPath = `/api${originalPath}`;
    
    log(`İstek yönlendiriliyor: ${req.originalUrl} -> ${apiPath}`);
    
    // URL'i API rotasına çevirelim
    req.url = apiPath;
    
    // Eğer POST isteği ise content-type'ı kontrol edelim
    if (req.method === 'POST' || req.method === 'PUT') {
      res.setHeader('Content-Type', 'application/json');
    }
    
    // CORS headerlarını ekleyelim
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Bir sonraki middleware'e geçelim
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
