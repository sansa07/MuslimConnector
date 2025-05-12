import { db } from "../db";
import { notifications, type Notification } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { sendEmail, getNotificationEmailHtml } from "./email";

// Bildirim tipleri
export const NotificationType = {
  LIKE: "like",
  COMMENT: "comment",
  FOLLOW: "follow",
  DUA: "dua",
  EVENT: "event",
  ADMIN: "admin",
  SYSTEM: "system",
};

// Bildirim oluştur
export async function createNotification(
  userId: string,
  type: string,
  message: string,
  linkUrl: string | null = null,
  sendEmailNotification: boolean = false
): Promise<Notification> {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      message,
      linkUrl,
      isRead: false,
    })
    .returning();

  // E-posta bildirimini de gönder
  if (sendEmailNotification) {
    try {
      // Kullanıcı bilgilerini al
      const [user] = await db
        .select({
          email: "email",
          username: "username",
          firstName: "firstName",
          lastName: "lastName",
        })
        .from("users")
        .where(eq("users.id", userId));

      if (user && user.email) {
        const username = user.firstName || user.username || "Değerli Kullanıcı";
        const actionUrl = linkUrl 
          ? process.env.APP_URL + linkUrl 
          : process.env.APP_URL + "/notifications";
          
        await sendEmail({
          to: user.email,
          subject: "Yeni Bildirim - İslami Sosyal Ağ",
          html: getNotificationEmailHtml(
            username,
            message,
            actionUrl,
            "Bildirime Git"
          ),
        });
      }
    } catch (error) {
      console.error("E-posta bildirimi gönderilemedi:", error);
    }
  }

  return notification;
}

// Toplu bildirim gönder
export async function createMassNotification(
  userIds: string[],
  type: string,
  message: string,
  linkUrl: string | null = null,
  sendEmailNotification: boolean = false
): Promise<void> {
  // Her kullanıcı için bildirim oluştur
  const notificationValues = userIds.map((userId) => ({
    userId,
    type,
    message,
    linkUrl,
    isRead: false,
  }));

  // Boş dizi kontrolü
  if (notificationValues.length === 0) {
    return;
  }

  // Toplu bildirim ekleme
  await db.insert(notifications).values(notificationValues);

  // E-posta bildirimleri
  if (sendEmailNotification) {
    try {
      // Kullanıcı e-postalarını al
      const users = await db
        .select({
          id: "id",
          email: "email",
          username: "username",
          firstName: "firstName",
        })
        .from("users")
        .where(eq("users.id", userIds));

      // E-postaları gönder
      for (const user of users) {
        if (user.email) {
          const username = user.firstName || user.username || "Değerli Kullanıcı";
          const actionUrl = linkUrl 
            ? process.env.APP_URL + linkUrl 
            : process.env.APP_URL + "/notifications";
            
          await sendEmail({
            to: user.email,
            subject: "Yeni Bildirim - İslami Sosyal Ağ",
            html: getNotificationEmailHtml(
              username,
              message,
              actionUrl,
              "Bildirime Git"
            ),
          });
        }
      }
    } catch (error) {
      console.error("Toplu e-posta bildirimleri gönderilemedi:", error);
    }
  }
}

// Kullanıcının bildirimlerini getir
export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

// Bildirim okundu olarak işaretle
export async function markNotificationAsRead(
  notificationId: number
): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

// Kullanıcının tüm bildirimlerini okundu olarak işaretle
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

// Okunmamış bildirim sayısını getir
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const [result] = await db
    .select({ count: db.fn.count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    );

  return Number(result?.count || 0);
}