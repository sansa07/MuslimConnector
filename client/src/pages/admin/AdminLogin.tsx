import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function AdminLogin() {
  const auth = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Hata",
        description: "Kullanıcı adı ve şifre gereklidir",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      try {
        // Normal bir fetch isteği gönder
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Giriş başarısız');
        }
        
        const userData = await response.json();
        
        // Admin kontrolü yap
        if (userData.role !== 'admin') {
          throw new Error('Yönetici yetkisi gerekli');
        }
        
        toast({
          title: "Giriş Başarılı",
          description: "Yönetici paneline yönlendiriliyorsunuz...",
        });
        
        // Admin dashboard'a yönlendir
        setLocation('/admin/dashboard');
      } else {
        toast({
          title: "Giriş Başarısız",
          description: "Geçersiz yönetici kimlik bilgileri",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Giriş Hatası",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Yönetici Girişi</CardTitle>
          <CardDescription className="text-center">
            Yönetici paneline erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Kullanıcı Adı</label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Şifre</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}