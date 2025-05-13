import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserManagement } from "@/components/admin/UserManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { IconUsers, IconFileWarning, IconLogout, IconHome } from "@/lib/icons";

const Dashboard = () => {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const [location] = useLocation();

  // Admin durumunu kontrol et
  const { data: adminStatus, isLoading } = useQuery({
    queryKey: ["/api/admin/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/status");
      return res.json();
    },
    retry: false,
  });

  // Admin değilse login sayfasına yönlendir
  useEffect(() => {
    if (!isLoading && adminStatus && !adminStatus.isAdmin) {
      toast({
        title: "Yetkisiz erişim",
        description: "Yönetici paneline erişim için giriş yapmanız gerekiyor",
        variant: "destructive",
      });
      navigate("/admin");
    }
  }, [adminStatus, isLoading, navigate, toast]);

  // Admin çıkış fonksiyonu
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      toast({
        title: "Çıkış başarılı",
        description: "Yönetici oturumunuz sonlandırıldı",
      });
      navigate("/admin");
    } catch (error) {
      toast({
        title: "Çıkış başarısız",
        description: "Bir hata oluştu, lütfen tekrar deneyin",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!adminStatus?.isAdmin) {
    return null; // useEffect içinde yönlendirme yapılıyor
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-navy islamic-green:bg-emerald-100 islamic-gold:bg-amber-100 islamic-navy:bg-[#152238]">
      <header className="bg-white dark:bg-navy-dark islamic-green:bg-emerald-50 islamic-gold:bg-amber-50 islamic-navy:bg-[#1c3353] shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary dark:text-primary-light islamic-gold:text-amber-600 islamic-navy:text-blue-300">
            MüslimNet Yönetici Paneli
          </h1>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary">
              <IconHome className="w-5 h-5" />
            </Link>
            <button 
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <IconLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">120</div>
              <p className="text-xs text-muted-foreground">
                Son 30 günde 24 yeni kullanıcı
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">İşaretli Gönderiler</CardTitle>
              <IconFileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                8 gönderi incelenmeyi bekliyor
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktif Etkinlikler</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Bu hafta 3 yeni etkinlik eklendi
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="bg-white dark:bg-navy-dark islamic-green:bg-emerald-50 islamic-gold:bg-amber-50 islamic-navy:bg-[#1c3353] rounded-lg shadow-md">
          <TabsList className="w-full justify-start border-b px-4 pt-2">
            <TabsTrigger value="users" className="rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Kullanıcı Yönetimi
            </TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary">
              İçerik Moderasyonu
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="p-4">
            <UserManagement />
          </TabsContent>
          <TabsContent value="moderation" className="p-4">
            <ContentModeration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;