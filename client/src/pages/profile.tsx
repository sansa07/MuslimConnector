import { useState, useEffect } from "react";
import { useNavigate } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { IconCamera, IconProfile, IconSave, IconSettings } from "@/lib/icons";

// Form şeması
const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
  bio: z.string().max(500, "Biyografi en fazla 500 karakter olabilir").optional(),
  profileImageUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePage() {
  const [, navigate] = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      profileImageUrl: user?.profileImageUrl || "",
    },
  });

  // Form değerleri kullanıcı verisi yüklendiğinde güncellenir
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
        profileImageUrl: user.profileImageUrl || "",
      });
      
      if (user.profileImageUrl) {
        setImagePreview(user.profileImageUrl);
      }
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, values);
      if (!res.ok) {
        throw new Error("Profil güncellenirken bir hata oluştu");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil güncellendi",
        description: "Profiliniz başarıyla güncellendi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    if (imagePreview && imagePreview !== user?.profileImageUrl) {
      values.profileImageUrl = imagePreview;
    }
    updateProfileMutation.mutate(values);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Normalde burada gerçek bir dosya yükleme işlemi yapılacak
    // Şimdilik basit bir önizleme gösterelim
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Dosya yüklenirken hata:", error);
      setUploadingImage(false);
      toast({
        title: "Hata",
        description: "Profil resmi yüklenirken bir hata oluştu",
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

  if (!isAuthenticated) {
    return null; // useEffect bizi /auth'a yönlendirecek
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "KU";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Profil Sayfası</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <IconProfile className="w-4 h-4" />
              <span>Profil Bilgileri</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <IconSettings className="w-4 h-4" />
              <span>Ayarlar</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Profilinizi güncelleyin ve diğer kullanıcıların sizi nasıl gördüğünü yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative mb-4">
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={imagePreview || user?.profileImageUrl || undefined} />
                          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                            {getInitials(user?.firstName, user?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <label 
                          htmlFor="profile-image" 
                          className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90"
                        >
                          <IconCamera className="w-5 h-5" />
                          <input 
                            id="profile-image" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">Profil resminizi değiştirmek için tıklayın</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input placeholder="Adınız" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                              <Input placeholder="Soyadınız" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="E-posta adresiniz" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormDescription>
                            E-posta adresiniz bildirimler için kullanılacaktır
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biyografi</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Kendinizden bahsedin..." 
                              className="resize-none min-h-[120px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Bu bilgi profilinizde görünecektir
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="flex items-center gap-2"
                        disabled={updateProfileMutation.isPending}
                      >
                        <IconSave className="w-4 h-4" />
                        <span>{updateProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}</span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Hesap Ayarları</CardTitle>
                <CardDescription>
                  Hesap tercihlerinizi yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Bildirimler</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hangi bildirimleri almak istediğinizi belirleyin
                  </p>
                  
                  {/* Burada bildirim ayarları eklenebilir */}
                  <p className="text-sm text-muted-foreground">Bildirim ayarları yakında eklenecek</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Gizlilik</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hesap gizlilik ayarlarınızı yönetin
                  </p>
                  
                  {/* Burada gizlilik ayarları eklenebilir */}
                  <p className="text-sm text-muted-foreground">Gizlilik ayarları yakında eklenecek</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium text-destructive">Tehlikeli İşlemler</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bu işlemler geri alınamaz, dikkatli olun
                  </p>
                  
                  <Button variant="destructive">Hesabımı Sil</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ProfilePage;