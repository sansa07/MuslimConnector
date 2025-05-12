import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface Notification {
  id: number;
  userId: string;
  type: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function UserNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Bildirimleri getir
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/notifications");
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((notif: Notification) => !notif.isRead).length);
    } catch (error) {
      console.error("Bildirimler getirilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bildirimi okundu olarak işaretle
  const markAsRead = async (id: number) => {
    try {
      await apiRequest("POST", `/api/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Bildirim okundu olarak işaretlenemedi:", error);
    }
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    try {
      await apiRequest("POST", "/api/notifications/read-all");
      setNotifications(
        notifications.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Bildirimler okundu olarak işaretlenemedi:", error);
    }
  };
  
  // Component yüklendiğinde bildirimleri getir
  useEffect(() => {
    fetchNotifications();
    
    // Bildirim polling - gerçek uygulamada web socket kullanılabilir
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Her dakika güncelle
    
    return () => clearInterval(interval);
  }, []);
  
  // Bildirim ikonunun tipini belirle
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <span className="text-red-500">❤️</span>;
      case "comment":
        return <span>💬</span>;
      case "follow":
        return <span>👤</span>;
      case "dua":
        return <span>🤲</span>;
      case "event":
        return <span>📅</span>;
      default:
        return <span>📣</span>;
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Bildirimler</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={markAllAsRead}
            >
              Tümünü okundu işaretle
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Hiç bildiriminiz yok
          </div>
        ) : (
          <DropdownMenuGroup>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`py-3 px-4 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm mb-1">
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                      {!notification.isRead && (
                        <Badge variant="secondary" className="text-xs">Yeni</Badge>
                      )}
                    </div>
                    {notification.linkUrl && (
                      <Link href={notification.linkUrl}>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          Görüntüle
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full text-center py-2 cursor-pointer">
            Tüm bildirimleri görüntüle
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}