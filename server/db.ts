import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Veritabanı bağlantısı için pool ve db nesnelerini tanımlıyoruz
let pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Bağlantı kurma fonksiyonu - hata durumunda yeniden bağlanmak için kullanılabilir
export async function connectToDatabase(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL bulunamadı, veritabanı bağlantısı yapılamayacak");
      return false;
    }
    
    // Eğer mevcut pool varsa ve açıksa, onu kapat
    if (pool) {
      try {
        await pool.end();
        console.log("Mevcut pool kapatıldı, yeniden bağlanılıyor...");
      } catch (err) {
        console.error("Pool kapatma hatası:", err);
      }
    }
    
    // Yeni pool oluştur
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
    
    // Test sorgusu çalıştır
    try {
      const client = await pool.connect();
      try {
        await client.query('SELECT NOW()');
        console.log("Veritabanı bağlantısı başarıyla test edildi");
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Veritabanı test sorgusu hatası:", err);
      return false;
    }
    
    // Drizzle ORM ile bağlantı kur
    _db = drizzle({ client: pool, schema });
    console.log("Veritabanı bağlantısı kuruldu");
    return true;
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);
    pool = null;
    _db = null;
    return false;
  }
}

// İlk bağlantıyı kur
try {
  // İlk bağlantıyı asenkron başlat
  connectToDatabase().then(success => {
    if (success) {
      console.log("Veritabanı bağlantısı başarıyla kuruldu");
    } else {
      console.warn("Veritabanı bağlantısı başarısız, bazı özellikler çalışmayabilir");
    }
  });
} catch (error) {
  console.error("İlk veritabanı bağlantısı başlatılırken hata:", error);
}

// db objesini daima erişilebilir hale getir
export const db = _db || drizzle({ 
  client: new Pool({ connectionString: process.env.DATABASE_URL || "" }), 
  schema 
});
export { pool };
