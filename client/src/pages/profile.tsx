import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/post-card";
import { Calendar, MessageSquare, HandHelping, Users } from "lucide-react";
import type { Post } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: ""
  });

  // Fetch user posts
  const {
    data: posts,
    isLoading: isLoadingPosts,
    refetch: refetchPosts
  } = useQuery({
    queryKey: [`/api/users/${user?.id}/posts`],
    enabled: !!user?.id
  });

  // Fetch followers
  const {
    data: followers,
    isLoading: isLoadingFollowers
  } = useQuery({
    queryKey: [`/api/users/${user?.id}/followers`],
    enabled: !!user?.id
  });

  // Fetch following
  const {
    data: following,
    isLoading: isLoadingFollowing
  } = useQuery({
    queryKey: [`/api/users/${user?.id}/following`],
    enabled: !!user?.id
  });

  // Profile update mutation
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", "/api/users/profile", formData);
    },
    onSuccess: () => {
      toast({
        title: "Profil güncellendi",
        description: "Profiliniz başarıyla güncellendi."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || ""
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile();
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "UK";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (isLoadingAuth) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start">
              <Skeleton className="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-6" />
              <div className="flex-1 text-center sm:text-left">
                <Skeleton className="h-7 w-48 mb-2 mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-72 mb-4 mx-auto sm:mx-0" />
                <div className="flex justify-center sm:justify-start space-x-4 mb-4">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Profil sayfasına erişim için giriş yapmalısınız</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Profil sayfanızı görüntülemek, paylaşımlarınızı yönetmek ve diğer özelliklerden yararlanmak için lütfen giriş yapın.
          </p>
          <a 
            href="/api/login" 
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
          >
            Giriş Yap
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="islamic-border overflow-hidden">
        <CardContent className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center sm:flex-row sm:items-start">
                <Avatar className="w-24 h-24 mb-4 sm:mb-0 sm:mr-6">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback>{getInitials(user?.firstName || "", user?.lastName || "")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-1">Ad</label>
                      <Input 
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-1">Soyad</label>
                      <Input 
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Soyadınız"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
                    <Input 
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Kullanıcı adınız"
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">Hakkımda</label>
                    <Textarea 
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Kendiniz hakkında kısa bir bilgi"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center sm:flex-row sm:items-start">
              <Avatar className="w-24 h-24 mb-4 sm:mb-0 sm:mr-6">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback>{getInitials(user?.firstName || "", user?.lastName || "")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-1">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  @{user?.username || user?.email?.split('@')[0]}
                </p>
                {user?.bio && (
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    {user.bio}
                  </p>
                )}
                <div className="flex justify-center sm:justify-start space-x-4 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-primary">{isLoadingFollowers ? "..." : followers?.length || 0}</div>
                    <div className="text-sm text-gray-500">Takipçi</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary">{isLoadingFollowing ? "..." : following?.length || 0}</div>
                    <div className="text-sm text-gray-500">Takip</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary">{isLoadingPosts ? "..." : posts?.length || 0}</div>
                    <div className="text-sm text-gray-500">Paylaşım</div>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Profili Düzenle
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="posts" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Paylaşımlar
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Etkinlikler
          </TabsTrigger>
          <TabsTrigger value="duas" className="flex-1">
            <HandHelping className="w-4 h-4 mr-2" />
            Dualar
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            Bağlantılar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {isLoadingPosts ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="mb-6">
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
            ))
          ) : posts && posts.length > 0 ? (
            posts.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Henüz paylaşımınız yok.</p>
              <p className="text-primary">İlk paylaşımınızı yapmak için anasayfaya dönebilirsiniz.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Henüz katıldığınız bir etkinlik yok.</p>
            <p className="text-primary">Etkinliklere katılmak için etkinlikler sayfasını ziyaret edebilirsiniz.</p>
          </div>
        </TabsContent>

        <TabsContent value="duas" className="space-y-6">
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Henüz dua isteğiniz yok.</p>
            <p className="text-primary">Dua istekleri oluşturmak için dualar sayfasını ziyaret edebilirsiniz.</p>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Takipçiler</h3>
            </CardHeader>
            <CardContent>
              {isLoadingFollowers ? (
                <div className="flex space-x-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-12 rounded-full" />
                  ))}
                </div>
              ) : followers && followers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {followers.map((follower: any) => (
                    <div key={follower.id} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={follower.profileImageUrl} />
                        <AvatarFallback>{getInitials(follower.firstName || "", follower.lastName || "")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{follower.firstName} {follower.lastName}</p>
                        <p className="text-xs text-gray-500">@{follower.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Henüz takipçiniz yok.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Takip Ettikleriniz</h3>
            </CardHeader>
            <CardContent>
              {isLoadingFollowing ? (
                <div className="flex space-x-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-12 rounded-full" />
                  ))}
                </div>
              ) : following && following.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {following.map((follow: any) => (
                    <div key={follow.id} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={follow.profileImageUrl} />
                        <AvatarFallback>{getInitials(follow.firstName || "", follow.lastName || "")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{follow.firstName} {follow.lastName}</p>
                        <p className="text-xs text-gray-500">@{follow.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Henüz kimseyi takip etmiyorsunuz.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
