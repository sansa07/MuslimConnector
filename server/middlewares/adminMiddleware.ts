import { Request, Response, NextFunction } from 'express';

/**
 * Yönetici erişimi için middleware
 * Kullanıcının oturumu açık ve yönetici rolüne sahip olup olmadığını kontrol eder
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Kullanıcı oturumu açık değilse
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Yönetici paneline erişmek için giriş yapmanız gerekiyor' 
      });
    }

    // Kullanıcı bilgilerinde role kontrolü yap
    const user = req.user as any;
    
    if (user && user.role === 'admin') {
      // Kullanıcı yönetici rolüne sahipse devam et
      return next();
    }

    // Yönetici rolüne sahip değilse erişimi reddet
    return res.status(403).json({ 
      success: false, 
      message: 'Yönetici paneline erişim izniniz yok' 
    });
  } catch (error) {
    console.error('Yönetici middleware hatası:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Yönetici erişim kontrolü sırasında bir hata oluştu' 
    });
  }
}