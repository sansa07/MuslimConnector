import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import PostCard from "@/components/posts/PostCard";
import HadithPostCard from "@/components/posts/HadithPostCard";
import EventCard from "@/components/events/EventCard";
import DuaRequestCard from "@/components/dua/DuaRequestCard";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  IconUser, 
  IconCalendar, 
  IconLocation, 
  IconEdit, 
  IconSave, 
  IconCancel 
} from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });
  
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/profile/posts"],
    enabled: isAuthenticated,
  });
  
  const { data: savedPosts, isLoading: savedLoading } = useQuery({
    queryKey: ["/api/profile/saved"],
    enabled: isAuthenticated,
  });
  
  const { data: userDuaRequests, isLoading: duaLoading } = useQuery({
    queryKey: ["/api/profile/dua-requests"],
    enabled: isAuthenticated,
  });
  
  const { data: userEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/profile/events"],
    enabled: isAuthenticated,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { bio: string }) => {
      const response = await apiRequest("PATCH", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profil güncellendi",
        description: "Profiliniz başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Profil güncellenemedi: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setBio(profile?.bio || "");
    } else {
      setIsEditing(true);
      setBio(profile?.bio || "");
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ bio });
  };

  const formatJoinDate = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: tr
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold font-amiri mb-4">Profil Sayfası</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Profilinizi görüntülemek için giriş yapmalısınız.</p>
        <a 
          href="/api/login"
          className="inline-block py-2 px-6 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          Giriş Yap
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <title>Profil - MüslimNet</title>
        <meta name="description" content="Kişisel profiliniz, paylaşımlarınız, dua istekleriniz ve etkinlikleriniz." />
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-navy-dark rounded-lg shadow-md overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary via-gold to-primary opacity-20"></div>
        
        <div className="px-6 py-4 relative">
          <div className="absolute -top-16 left-6">
            <img 
              src={user?.profileImageUrl || "https://via.placeholder.com/100"} 
              alt="Profil Fotoğrafı" 
              className="w-24 h-24 rounded-full border-4 border-white dark:border-navy-dark object-cover"
            />
          </div>
          
          <div className="mt-12 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                {profile?.createdAt && (
                  <div className="flex items-center">
                    <IconCalendar className="mr-1" />
                    <span>Katılma: {formatJoinDate(profile.createdAt)}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center">
                    <IconLocation className="mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditToggle}
              className="flex items-center"
            >
              {isEditing ? (
                <>
                  <IconCancel className="mr-1" />
                  <span>İptal</span>
                </>
              ) : (
                <>
                  <IconEdit className="mr-1" />
                  <span>Düzenle</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Bio Section */}
          <div className="mt-4">
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Kendinizi tanıtın..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditToggle}
                  >
                    <IconCancel className="mr-1" />
                    <span>İptal</span>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    <IconSave className="mr-1" />
                    <span>{updateProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                {profileLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : profile?.bio ? (
                  profile.bio
                ) : (
                  "Henüz bir bio eklenmemiş."
                )}
              </p>
            )}
          </div>
          
          {/* Stats */}
          {!profileLoading && profile && (
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-primary bg-opacity-10 rounded-lg px-4 py-2 text-center">
                <div className="text-xl font-bold text-primary">{profile.postCount}</div>
                <div className="text-sm">Paylaşım</div>
              </div>
              <div className="bg-primary bg-opacity-10 rounded-lg px-4 py-2 text-center">
                <div className="text-xl font-bold text-primary">{profile.followersCount}</div>
                <div className="text-sm">Takipçi</div>
              </div>
              <div className="bg-primary bg-opacity-10 rounded-lg px-4 py-2 text-center">
                <div className="text-xl font-bold text-primary">{profile.followingCount}</div>
                <div className="text-sm">Takip Edilen</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs for Content */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="posts" className="flex-1">Paylaşımlar</TabsTrigger>
          <TabsTrigger value="saved" className="flex-1">Kaydedilenler</TabsTrigger>
          <TabsTrigger value="duas" className="flex-1">Dua İstekleri</TabsTrigger>
          <TabsTrigger value="events" className="flex-1">Etkinlikler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          {postsLoading ? (
            [...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-64 mb-6 rounded-lg" />
            ))
          ) : userPosts?.length > 0 ? (
            userPosts.map((post: any) => (
              post.type === "hadith" ? (
                <HadithPostCard key={post.id} post={post} />
              ) : (
                <PostCard key={post.id} post={post} />
              )
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz paylaşım yapmadınız.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          {savedLoading ? (
            [...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-64 mb-6 rounded-lg" />
            ))
          ) : savedPosts?.length > 0 ? (
            savedPosts.map((post: any) => (
              post.type === "hadith" ? (
                <HadithPostCard key={post.id} post={post} />
              ) : (
                <PostCard key={post.id} post={post} />
              )
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz bir paylaşım kaydetmediniz.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="duas">
          {duaLoading ? (
            <Skeleton className="h-48 mb-6 rounded-lg" />
          ) : userDuaRequests?.length > 0 ? (
            userDuaRequests.map((duaRequest: any) => (
              <DuaRequestCard key={duaRequest.id} duaRequest={duaRequest} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz bir dua isteği oluşturmadınız.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="events">
          {eventsLoading ? (
            <Skeleton className="h-64 mb-6 rounded-lg" />
          ) : userEvents?.length > 0 ? (
            userEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz bir etkinliğe katılmadınız veya oluşturmadınız.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Profile;
