import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Mail, Lock, Facebook, Github, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

export default function Login() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<"email" | "social">("social");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReplitAuthDialog, setShowReplitAuthDialog] = useState(false);
  
  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  if (isAuthenticated) {
    navigate("/");
    return null;
  }
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Şu anda sadece Replit giriş sistemi olduğu için, bu işlev çalışmaz
    // İlerleyen süreçte e-posta giriş işlemi eklenecektir
    toast({
      title: t("auth.emailLoginNotAvailable"),
      description: t("auth.useOtherMethods"),
      variant: "destructive",
    });
    
    setIsLoading(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-10">
      <Card className="w-full islamic-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-amiri">{t("auth.login")}</CardTitle>
          <CardDescription>
            {t("auth.chooseLoginMethod")}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "email" | "social")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">{t("auth.socialLogin")}</TabsTrigger>
            <TabsTrigger value="email">{t("auth.emailLogin")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="pt-4">
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowReplitAuthDialog(true)}
              >
                <img src="/replit-logo.svg" alt="Replit" className="w-5 h-5" />
                <span>Replit ile Giriş Yap</span>
              </Button>
              
              {/* Replit Kimlik Doğrulama Açıklama Dialogu */}
              <Dialog open={showReplitAuthDialog} onOpenChange={setShowReplitAuthDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Replit Kimlik Doğrulama
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      Replit ile giriş yapmak için yeni bir pencere açılacaktır. 
                      Bu pencerede Replit hesabınızla giriş yapmanız gerekecek.
                      <br /><br />
                      Giriş işlemi tamamlandıktan sonra ana sayfaya yönlendirileceksiniz.
                      <br /><br />
                      <strong>Not:</strong> Giriş işlemi tamamlanmazsa pencere 30 saniye sonra otomatik kapanır.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setShowReplitAuthDialog(false)}>
                      İptal
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowReplitAuthDialog(false);
                        // Yeni sekme/pencere açma
                        const loginWindow = window.open('/api/login', '_blank');
                        
                        // 30 saniye sonra pencereyi kontrol et, hala açıksa kapat
                        setTimeout(() => {
                          if (loginWindow && !loginWindow.closed) {
                            loginWindow.close();
                            toast({
                              title: "Giriş işlemi tamamlanamadı",
                              description: "Giriş işlemi için açılan pencere otomatik olarak kapatıldı.",
                              variant: "destructive",
                            });
                          }
                        }, 30000);
                      }}
                    >
                      Devam Et
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
                <FcGoogle className="w-5 h-5" />
                <span>Google ile Giriş Yap</span>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook ile Giriş Yap</span>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
                <Github className="w-5 h-5" />
                <span>Github ile Giriş Yap</span>
              </Button>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="email" className="pt-4">
            <form onSubmit={handleEmailLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t("auth.email")}
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t("auth.password")}
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("general.loading") : t("auth.login")}
                </Button>
              </CardContent>
            </form>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <div className="w-full flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">{t("auth.or")}</span>
            <Separator className="flex-1" />
          </div>
          
          <div className="text-center text-sm">
            {t("auth.dontHaveAccount")}{" "}
            <a href="/register" className="text-primary hover:underline">
              {t("auth.register")}
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}