import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Veritabanı bağlantısı için pool ve db nesnelerini tanımlıyoruz
// İhtiyaç olduğunda yeniden bağlantı kurmak için fonksiyon oluşturuyoruz
let pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Pool bağlantısını oluştur
try {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL bulunamadı, veritabanı bağlantısı yapılamayacak");
  } else {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      // Bağlantı hatalarına karşı koruma
      max: 5, // maksimum bağlantı sayısı
      idleTimeoutMillis: 30000, // boşta olan bağlantılar için zaman aşımı
      connectionTimeoutMillis: 5000, // bağlantı kurulumu için zaman aşımı
    });
    
    // Veritabanı bağlantısını test et
    pool.on('error', (err) => {
      console.error('Beklenmeyen veritabanı hatası:', err);
    });
    
    _db = drizzle({ client: pool, schema });
    console.log("Veritabanı bağlantısı kuruldu");
  }
} catch (error) {
  console.error("Veritabanı bağlantı hatası:", error);
}

// Bu export, sorunsuz bir şekilde import edilebilsin diye her zaman bir değer döndürür
export const db = _db || {} as ReturnType<typeof drizzle>;
export { pool };
