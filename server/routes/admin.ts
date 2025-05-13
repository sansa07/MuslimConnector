import express from 'express';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { storage } from '../storage';

const router = express.Router();

// Admin middleware ile tüm admin rotalarını koru
router.use(adminMiddleware);

// Tüm kullanıcıları getir
router.get('/users', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    
    // Hassas bilgileri temizle
    const safeUsers = users.map(user => {
      const safeUser = { ...user };
      if (safeUser.password) {
        safeUser.password = undefined;
      }
      return safeUser;
    });
    
    res.json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilirken bir hata oluştu'
    });
  }
});

// Kullanıcıyı yasakla
router.post('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Yasaklama sebebi belirtilmelidir'
      });
    }
    
    const user = await storage.banUser(id, reason);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    // Hassas bilgileri temizle
    const safeUser = { ...user };
    delete safeUser.password;
    
    res.json({
      success: true,
      message: 'Kullanıcı başarıyla yasaklandı',
      data: safeUser
    });
  } catch (error) {
    console.error('Admin ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı yasaklanırken bir hata oluştu'
    });
  }
});

// Kullanıcı yasağını kaldır
router.post('/users/:id/unban', async (req, res) => {
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
    delete safeUser.password;
    
    res.json({
      success: true,
      message: 'Kullanıcı yasağı başarıyla kaldırıldı',
      data: safeUser
    });
  } catch (error) {
    console.error('Admin unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı yasağı kaldırılırken bir hata oluştu'
    });
  }
});

// İşaretlenmiş gönderileri getir
router.get('/flagged-content/posts', async (req, res) => {
  try {
    const flaggedPosts = await storage.getFlaggedPosts();
    
    res.json({
      success: true,
      data: flaggedPosts
    });
  } catch (error) {
    console.error('Admin flagged posts error:', error);
    res.status(500).json({
      success: false,
      message: 'İşaretlenmiş gönderiler getirilirken bir hata oluştu'
    });
  }
});

// İşaretlenmiş yorumları getir
router.get('/flagged-content/comments', async (req, res) => {
  try {
    const flaggedComments = await storage.getFlaggedComments();
    
    res.json({
      success: true,
      data: flaggedComments
    });
  } catch (error) {
    console.error('Admin flagged comments error:', error);
    res.status(500).json({
      success: false,
      message: 'İşaretlenmiş yorumlar getirilirken bir hata oluştu'
    });
  }
});

// Gönderiyi güncelle (onay veya reddetme)
router.patch('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isFlagged, moderationStatus, moderationNote } = req.body;
    
    const post = await storage.updatePost(parseInt(id), {
      flaggedForContent: isFlagged,
      moderationStatus: moderationStatus || 'reviewed',
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
    console.error('Admin update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Gönderi güncellenirken bir hata oluştu'
    });
  }
});

// Yorumu güncelle (onay veya reddetme)
router.patch('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isFlagged, moderationStatus, moderationNote } = req.body;
    
    const comment = await storage.updateComment(parseInt(id), {
      flaggedForContent: isFlagged,
      moderationStatus: moderationStatus || 'reviewed',
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
    console.error('Admin update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum güncellenirken bir hata oluştu'
    });
  }
});

// Admin durumu kontrolü
router.get('/status', (req, res) => {
  // Kullanıcı adminMiddleware'den geçtiyse, bu noktaya ulaşmıştır
  // Bu da onun admin olduğu anlamına gelir
  const user = req.user as any;
  
  res.json({
    success: true,
    message: 'Yönetici erişimi onaylandı',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

export default router;