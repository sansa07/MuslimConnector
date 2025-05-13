import { Request, Response, NextFunction } from "express";

// Admin yetkisi kontrolü yapan middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.isAdmin) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: "Yönetici paneline erişim için yetkiniz bulunmuyor."
  });
};