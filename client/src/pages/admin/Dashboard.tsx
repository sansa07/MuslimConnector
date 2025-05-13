import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCog, UserX, Flag, MessageSquare, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    bannedUsers: 0,
    flaggedPosts: 0,
    flaggedComments: 0
  });
  const [loading, setLoading] = useState(true);

  // Admin erişimi kontrolü
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated) {
        toast({
          title: "Erişim Reddedildi",
          description: "Bu sayfaya erişmek için giriş yapmanız gerekiyor",
          variant: "destructive",
        });
        setLocation('/admin/login');
        return;
      }

      try {
        const res = await fetch('/api/admin/status');
        if (!res.ok) {
          // Yönetici değilse
          toast({
            title: "Yetkisiz Erişim",
            description: "Bu sayfaya erişim yetkiniz yok",
            variant: "destructive",
          });
          setLocation('/');
          return;
        }
        
        // Admin erişimi doğrulandı, istatistikleri yükle
        loadStats();
      } catch (error) {
        toast({
          title: "Bağlantı Hatası",
          description: "Yönetici durumu kontrol edilirken bir hata oluştu",
          variant: "destructive",
        });
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, setLocation, toast]);

  // İstatistikleri yükle
  const loadStats = async () => {
    setLoading(true);
    try {
      // Kullanıcıları getir
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const users = usersData.data || [];
        const bannedCount = users.filter((user: any) => user.isBanned).length;
        
        // İşaretlenmiş gönderileri getir
        const flaggedPostsRes = await fetch('/api/admin/flagged-content/posts');
        const flaggedPostsData = await flaggedPostsRes.json();
        
        // İşaretlenmiş yorumları getir
        const flaggedCommentsRes = await fetch('/api/admin/flagged-content/comments');
        const flaggedCommentsData = await flaggedCommentsRes.json();
        
        setStats({
          totalUsers: users.length,
          bannedUsers: bannedCount,
          flaggedPosts: (flaggedPostsData.data || []).length,
          flaggedComments: (flaggedCommentsData.data || []).length
        });
      }
    } catch (error) {
      toast({
        title: "Veri Yükleme Hatası",
        description: "İstatistikler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Veritabanı bağlantısını yeniden kur
  const reconnectDatabase = async () => {
    try {
      const res = await fetch('/api/db-check');
      const data = await res.json();
      
      toast({
        title: data.success ? "Bağlantı Başarılı" : "Bağlantı Başarısız",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Bağlantı Hatası",
        description: "Veritabanı bağlantısı kontrol edilirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated || !user) {
    return null; // useEffect içinde yönlendirme yapılacak
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Yönetici Paneli</h1>
        
        <div className="space-x-4">
          <Button 
            variant="outline" 
            onClick={reconnectDatabase}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Veritabanını Yenile
          </Button>
          
          <Button 
            onClick={() => setLocation('/')}
            variant="secondary"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center">
          <UserCog className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{user.username || 'Admin'}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {user.role || 'Yönetici'}
        </Badge>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Toplam Kullanıcı</CardTitle>
              <CardDescription>Sisteme kayıtlı kullanıcı sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-500" />
                Yasaklı Kullanıcılar
              </CardTitle>
              <CardDescription>Sistemde yasaklanmış hesaplar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="h-4 w-4 text-yellow-500" />
                İşaretli İçerikler
              </CardTitle>
              <CardDescription>İnceleme bekleyen gönderiler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.flaggedPosts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-yellow-500" />
                İşaretli Yorumlar
              </CardTitle>
              <CardDescription>İnceleme bekleyen yorumlar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.flaggedComments}</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Erişim</CardTitle>
            <CardDescription>Yönetimsel işlemler için hızlı bağlantılar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation('/admin/users')}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Kullanıcı Yönetimi
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation('/admin/content')}
            >
              <Flag className="mr-2 h-4 w-4" />
              İçerik Moderasyonu
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sistem Durumu</CardTitle>
            <CardDescription>Sistem bileşenlerinin durumu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Veritabanı Bağlantısı</span>
                <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300">
                  Aktif
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Oturum Yönetimi</span>
                <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300">
                  Aktif
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>API Servisleri</span>
                <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300">
                  Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}