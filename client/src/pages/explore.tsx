import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/post-card";
import HadithPostCard from "@/components/hadith-post-card";
import EventCard from "@/components/event-card";
import DuaRequestCard from "@/components/dua-request-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Heart, MessageSquare, HandHelping, Search, UserRound } from "lucide-react";
import type { Post, Event, DuaRequest, User } from "@shared/schema";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch trending posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts 
  } = useQuery({
    queryKey: ['/api/posts', { limit: 10 }],
  });

  // Fetch events
  const { 
    data: events,
    isLoading: isLoadingEvents
  } = useQuery({
    queryKey: ['/api/events'],
  });

  // Fetch dua requests
  const { 
    data: duaRequests,
    isLoading: isLoadingDuaRequests
  } = useQuery({
    queryKey: ['/api/dua-requests'],
  });

  // For demonstration purposes - all users query would typically be admin-only
  // In production, we would implement a user search endpoint instead
  const { 
    data: users,
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['/api/users'],
    enabled: false, // Disable this query as it's just for demonstration
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we would call a search API endpoint
    console.log("Searching for:", searchTerm);
  };

  const renderSkeletons = (count: number = 3) => {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="mb-6">
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    ));
  };

  // Get initials for avatar fallback
  const getInitials = (name: string = "") => {
    if (!name) return "UK";
    return name.split(' ').map(n => n?.[0] || "").join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="islamic-border overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Keşfet: Paylaşımlar, kişiler, etkinlikler..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Ara
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Explore Tabs */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="trending" className="flex-1">
            <Heart className="w-4 h-4 mr-2" />
            Trend
          </TabsTrigger>
          <TabsTrigger value="people" className="flex-1">
            <UserRound className="w-4 h-4 mr-2" />
            Kişiler
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Etkinlikler
          </TabsTrigger>
          <TabsTrigger value="duas" className="flex-1">
            <HandHelping className="w-4 h-4 mr-2" />
            Dualar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          <h2 className="font-amiri text-xl font-bold text-primary dark:text-primary-light mb-4">
            Popüler Paylaşımlar
          </h2>
          
          {isLoadingPosts ? (
            renderSkeletons(3)
          ) : posts && posts.length > 0 ? (
            posts.map((post: Post) => (
              post.type === 'hadith' || post.type === 'ayet' ? (
                <HadithPostCard key={post.id} post={post} />
              ) : (
                <PostCard key={post.id} post={post} />
              )
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Henüz paylaşım bulunamadı.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          <h2 className="font-amiri text-xl font-bold text-primary dark:text-primary-light mb-4">
            Önerilen Kişiler
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 20}.jpg`} />
                      <AvatarFallback>{getInitials(`User ${index}`)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">
                        {index % 2 === 0 ? 'Ahmet Yılmaz' : 'Ayşe Demir'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{index % 2 === 0 ? 'ahmetyilmaz' : 'aysedemir'}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {index % 2 === 0 
                          ? 'İslami ilimler üzerine çalışıyorum. Kuran ve hadis paylaşımları yaparım.' 
                          : 'İslami eğitim ve aile konularında içerikler paylaşıyorum.'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      Takip Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <h2 className="font-amiri text-xl font-bold text-primary dark:text-primary-light mb-4">
            Yaklaşan Etkinlikler
          </h2>
          
          {isLoadingEvents ? (
            renderSkeletons(2)
          ) : events && events.length > 0 ? (
            events.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Henüz etkinlik bulunamadı.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="duas" className="space-y-6">
          <h2 className="font-amiri text-xl font-bold text-primary dark:text-primary-light mb-4">
            Dua İstekleri
          </h2>
          
          {isLoadingDuaRequests ? (
            renderSkeletons(2)
          ) : duaRequests && duaRequests.length > 0 ? (
            duaRequests.map((duaRequest: DuaRequest) => (
              <DuaRequestCard key={duaRequest.id} duaRequest={duaRequest} />
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Henüz dua isteği bulunamadı.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
