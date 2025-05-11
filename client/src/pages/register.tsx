import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "wouter";
import { Mail, Lock, User, Facebook, Github, CheckCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

export default function Register() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const [registerMethod, setRegisterMethod] = useState<"email" | "social">("social");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  if (isAuthenticated) {
    navigate("/");
    return null;
  }
  
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t("auth.passwordMismatch"),
        description: t("auth.passwordsMustMatch"),
        variant: "destructive",
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        title: t("auth.termsRequired"),
        description: t("auth.mustAgreeToTerms"),
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Şu anda sadece Replit giriş sistemi olduğu için, bu işlev çalışmaz
    // İlerleyen süreçte e-posta kayıt işlemi eklenecektir
    toast({
      title: t("auth.emailRegisterNotAvailable"),
      description: t("auth.useOtherMethods"),
      variant: "destructive",
    });
    
    setIsLoading(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-10">
      <Card className="w-full islamic-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-amiri">{t("auth.register")}</CardTitle>
          <CardDescription>
            {t("auth.createNewAccount")}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={registerMethod} onValueChange={(value) => setRegisterMethod(value as "email" | "social")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">{t("auth.socialLogin")}</TabsTrigger>
            <TabsTrigger value="email">{t("auth.emailRegister")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="pt-4">
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" asChild>
                <a href="/api/login">
                  <img src="/replit-logo.svg" alt="Replit" className="w-5 h-5" />
                  <span>Replit ile Kayıt Ol</span>
                </a>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
                <FcGoogle className="w-5 h-5" />
                <span>Google ile Kayıt Ol</span>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook ile Kayıt Ol</span>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
                <Github className="w-5 h-5" />
                <span>Github ile Kayıt Ol</span>
              </Button>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="email" className="pt-4">
            <form onSubmit={handleEmailRegister}>
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
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("auth.username")}
                      className="pl-9"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                
                <div className="space-y-2">
                  <div className="relative">
                    <CheckCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t("auth.confirmPassword")}
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("auth.agreeToTerms")}
                  </label>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("general.loading") : t("auth.register")}
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
            {t("auth.alreadyHaveAccount")}{" "}
            <a href="/login" className="text-primary hover:underline">
              {t("auth.login")}
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}