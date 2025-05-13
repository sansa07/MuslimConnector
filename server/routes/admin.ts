import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { isAdmin } from '../middlewares/adminMiddleware';

const router = Router();

// Admin API durumunu kontrol et
router.post('/status', isAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Yönetici oturumu aktif"
  });
});

// Tüm kullanıcıları getir (yönetici dashboard için)
router.get('/users', isAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const users = await storage.getAllUsers(limit, offset);
    
    // Hassas verileri temizle
    const safeUsers = users.map(user => {
      const safeUser = { ...user };
      if (safeUser.password) {
        safeUser.password = undefined;
      }
      return safeUser;
    });
    
    res.json({
      success: true,
      count: safeUsers.length,
      data: safeUsers
    });
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilirken bir hata oluştu'
    });
  }
});

// İşaretlenmiş gönderileri listele
router.get('/flagged-content/posts', isAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const posts = await storage.getFlaggedPosts(limit, offset);
    
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('İşaretlenmiş gönderiler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İşaretlenmiş gönderiler getirilirken bir hata oluştu'
    });
  }
});

// İşaretlenmiş yorumları listele
router.get('/flagged-content/comments', isAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const comments = await storage.getFlaggedComments(limit, offset);
    
    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('İşaretlenmiş yorumlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İşaretlenmiş yorumlar getirilirken bir hata oluştu'
    });
  }
});

// Kullanıcı yasakla
router.post('/users/:id/ban', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await storage.banUser(id, reason || 'Topluluk kurallarını ihlal');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    // Hassas bilgileri temizle
    const safeUser = { ...user };
    if (safeUser.password) {
      safeUser.password = undefined;
    }
    
    res.json({
      success: true,
      message: 'Kullanıcı başarıyla yasaklandı',
      data: safeUser
    });
  } catch (error) {
    console.error('Kullanıcı yasaklanırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı yasaklanırken bir hata oluştu'
    });
  }
});

// Kullanıcı yasağını kaldır
router.post('/users/:id/unban', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await storage.unbanUser(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    // Hassas bilgileri temizle
    const safeUser = { ...user };
    if (safeUser.password) {
      safeUser.password = undefined;
    }
    
    res.json({
      success: true,
      message: 'Kullanıcı yasağı başarıyla kaldırıldı',
      data: safeUser
    });
  } catch (error) {
    console.error('Kullanıcı yasağı kaldırılırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı yasağı kaldırılırken bir hata oluştu'
    });
  }
});

// Gönderi moderasyon işlemi
router.put('/posts/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFlagged, moderationStatus, moderationNote } = req.body;
    
    const post = await storage.updatePost(parseInt(id), {
      flaggedForContent: isFlagged,
      isModerated: true,
      moderationComment: moderationNote
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Gönderi bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Gönderi başarıyla güncellendi',
      data: post
    });
  } catch (error) {
    console.error('Gönderi güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Gönderi güncellenirken bir hata oluştu'
    });
  }
});

// Yorum moderasyon işlemi
router.put('/comments/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFlagged, moderationStatus, moderationNote } = req.body;
    
    const comment = await storage.updateComment(parseInt(id), {
      flaggedForContent: isFlagged,
      isModerated: true,
      moderationComment: moderationNote
    });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Yorum başarıyla güncellendi',
      data: comment
    });
  } catch (error) {
    console.error('Yorum güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum güncellenirken bir hata oluştu'
    });
  }
});

export default router;