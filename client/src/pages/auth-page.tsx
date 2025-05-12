import { useState } from "react";
import { useAuth } from "@/hooks/useAuth.tsx";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Facebook, Github, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Kullanıcı adı en az 3 karakter olmalıdır",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Kullanıcı adı en az 3 karakter olmalıdır",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [socialAuthError, setSocialAuthError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(values);
  }

  async function handleSocialAuth(provider: string) {
    setSocialAuthError(null);
    
    try {
      if (provider === "facebook") {
        // Normally, we would use the Facebook SDK for authentication
        // For simplicity, we'll just simulate a direct API call
        const mockFacebookToken = "mock_facebook_token";
        const response = await apiRequest("POST", "/api/auth/facebook", { accessToken: mockFacebookToken });
        
        if (!response.ok) {
          throw new Error("Facebook ile giriş başarısız");
        }
      } else if (provider === "google") {
        // Normally would use Google Auth SDK
        const mockGoogleToken = "mock_google_token";
        const response = await apiRequest("POST", "/api/auth/google", { idToken: mockGoogleToken });
        
        if (!response.ok) {
          throw new Error("Google ile giriş başarısız");
        }
      } else if (provider === "github") {
        // Redirect to GitHub OAuth flow
        window.location.href = "/api/auth/github";
      }
    } catch (error) {
      console.error(`Error during ${provider} authentication:`, error);
      setSocialAuthError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} ile giriş yapılırken bir hata oluştu`);
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-[1200px] gap-6 md:grid-cols-2">
        {/* Auth Form */}
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">İslami Sosyal Ağa Hoş Geldiniz</CardTitle>
              <CardDescription>
                Bilgi, tecrübe ve duaları paylaşmak için hesabınıza giriş yapın
              </CardDescription>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Giriş</TabsTrigger>
                <TabsTrigger value="register">Kayıt</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="p-1">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kullanıcı Adı</FormLabel>
                          <FormControl>
                            <Input placeholder="kullaniciadi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şifre</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="p-1">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ad" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                              <Input placeholder="Soyad" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kullanıcı Adı</FormLabel>
                          <FormControl>
                            <Input placeholder="kullaniciadi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ornek@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şifre</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <CardFooter className="flex flex-col p-6 pt-0">
              {socialAuthError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Hata</AlertTitle>
                  <AlertDescription>{socialAuthError}</AlertDescription>
                </Alert>
              )}
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Veya şununla devam et</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleSocialAuth("google")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11.99 13.9v-3.72h9.36c.14.63.25 1.22.25 2.05c0 5.71-3.83 9.77-9.6 9.77c-5.52 0-10-4.48-10-10S6.48 2 12 2c2.7 0 4.96.99 6.69 2.61l-2.84 2.76c-.72-.68-1.98-1.48-3.85-1.48c-3.31 0-6.01 2.75-6.01 6.12s2.7 6.12 6.01 6.12c3.83 0 5.24-2.65 5.5-4.22h-5.51v-.01Z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialAuth("facebook")}
                >
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialAuth("github")}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">
                  {activeTab === "login" ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
                </span>
                <button 
                  type="button"
                  className="underline text-primary font-medium"
                  onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                >
                  {activeTab === "login" ? "Kayıt olun" : "Giriş yapın"}
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Hero Side */}
        <div className="hidden rounded-xl bg-gradient-to-br from-green-700 to-green-900 p-6 md:flex md:flex-col md:justify-center">
          <div className="mb-6 inline-block rounded-xl bg-white/10 p-2">
            <Mail className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">İslami Sosyal Ağ</h1>
          <p className="mb-6 text-lg text-green-100">
            Müslüman bireylerin bir araya gelip bilgi, tecrübe ve dualarını paylaşabilecekleri, 
            İslami kültürü ve değerleri yaşatacak dijital bir platform.
          </p>
          <ul className="space-y-2 text-green-100">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Dua istekleri ve manevi destek
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Dini sohbetler ve tartışma alanları
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Namaz vakitleri ve kandil günleri bilgilendirmesi
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Kuran-ı Kerim ve Hadis paylaşımları
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}