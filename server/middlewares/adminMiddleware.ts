import { Request, Response, NextFunction } from 'express';

/**
 * Yönetici yetkisi gerektiren rotalar için middleware
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Kullanıcı giriş yapmış mı kontrol et
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Yönetici paneline erişmek için giriş yapmanız gerekiyor'
    });
  }

  // Kullanıcı 'admin' rolüne sahip mi kontrol et
  const user = req.user as any;
  if (user && (user.role === 'admin' || user.username === 'admin')) {
    return next();
  }

  // Yetki yoksa erişim reddet
  return res.status(403).json({
    success: false,
    message: 'Bu sayfaya erişim yetkiniz yok'
  });
}