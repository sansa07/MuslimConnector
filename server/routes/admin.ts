import { Router } from "express";
import { storage } from "../storage";
import { isAdmin } from "../middlewares/adminMiddleware";

const adminRouter = Router();

// Admin authentication
adminRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (username === "admin" && password === "admin123") {
    if (!req.session) {
      return res.status(500).json({ success: false, message: "Oturum hatası" });
    }
    
    req.session.isAdmin = true;
    req.session.adminId = "admin";
    
    return res.status(200).json({ 
      success: true, 
      message: "Yönetici girişi başarılı"
    });
  }
  
  return res.status(401).json({ 
    success: false, 
    message: "Geçersiz kullanıcı adı veya şifre"
  });
});

// Check admin status
adminRouter.get("/status", (req, res) => {
  return res.status(200).json({ 
    isAdmin: req.session?.isAdmin || false
  });
});

// Logout
adminRouter.post("/logout", (req, res) => {
  if (req.session) {
    req.session.isAdmin = false;
    delete req.session.adminId;
  }
  
  return res.status(200).json({ 
    success: true, 
    message: "Çıkış yapıldı"
  });
});

// Get all users
adminRouter.get("/users", isAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const users = await storage.getAllUsers(limit, offset);
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Kullanıcılar yüklenirken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Kullanıcılar yüklenirken hata oluştu" 
    });
  }
});

// Ban a user
adminRouter.post("/users/:id/ban", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await storage.banUser(id, reason);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Kullanıcı bulunamadı" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Kullanıcı yasaklandı", 
      user 
    });
    
  } catch (error) {
    console.error("Kullanıcı yasaklanırken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Kullanıcı yasaklanırken hata oluştu" 
    });
  }
});

// Unban a user
adminRouter.post("/users/:id/unban", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await storage.unbanUser(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Kullanıcı bulunamadı" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Kullanıcı yasağı kaldırıldı", 
      user 
    });
    
  } catch (error) {
    console.error("Kullanıcı yasağı kaldırılırken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Kullanıcı yasağı kaldırılırken hata oluştu" 
    });
  }
});

// Get flagged content
adminRouter.get("/moderation/posts", isAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const flaggedPosts = await storage.getFlaggedPosts(limit, offset);
    return res.status(200).json({ posts: flaggedPosts });
  } catch (error) {
    console.error("İşaretli gönderiler yüklenirken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "İşaretli gönderiler yüklenirken hata oluştu" 
    });
  }
});

// Get flagged comments
adminRouter.get("/moderation/comments", isAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const flaggedComments = await storage.getFlaggedComments(limit, offset);
    return res.status(200).json({ comments: flaggedComments });
  } catch (error) {
    console.error("İşaretli yorumlar yüklenirken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "İşaretli yorumlar yüklenirken hata oluştu" 
    });
  }
});

// Approve/reject a post
adminRouter.post("/moderation/posts/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, moderationComment } = req.body;
    
    const post = await storage.updatePost(parseInt(id), {
      isApproved,
      isModerated: true,
      flaggedForContent: false,
      moderationComment
    });
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Gönderi bulunamadı" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Gönderi güncellendi", 
      post 
    });
    
  } catch (error) {
    console.error("Gönderi güncellenirken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Gönderi güncellenirken hata oluştu" 
    });
  }
});

// Approve/reject a comment
adminRouter.post("/moderation/comments/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, moderationComment } = req.body;
    
    const comment = await storage.updateComment(parseInt(id), {
      isApproved,
      isModerated: true,
      flaggedForContent: false,
      moderationComment
    });
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Yorum bulunamadı" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Yorum güncellendi", 
      comment 
    });
    
  } catch (error) {
    console.error("Yorum güncellenirken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Yorum güncellenirken hata oluştu" 
    });
  }
});

export default adminRouter;