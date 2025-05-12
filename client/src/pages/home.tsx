import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import PrayerTimesWidget from "@/components/prayer-times-widget";
import DailyVerse from "@/components/daily-verse";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import HadithPostCard from "@/components/hadith-post-card";
import EventCard from "@/components/event-card";
import DuaRequestCard from "@/components/dua-request-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Post, type Event, type DuaRequest } from "@shared/schema";

export default function Home() {
  const { isAuthenticated } = useAuth();

  // Fetch posts with error handling and fallback
  const { 
    data: posts = [], // varsayılan değer olarak boş dizi
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    refetch: refetchPosts 
  } = useQuery({
    queryKey: ['/api/posts'],
    retry: 3,
    retryDelay: 1000,
    // TanStack Query 5'te select kullanabiliriz, ancak onError 
    // query options içinde kullanılamaz, useEffect içinde kullanılabilir
    select: (data) => {
      return data || [];
    }
  });

  // Fetch events with error handling
  const { 
    data: events = [], // varsayılan değer olarak boş dizi
    isLoading: isLoadingEvents
  } = useQuery({
    queryKey: ['/api/events'],
    retry: 3,
    retryDelay: 1000,
    select: (data) => {
      return data || [];
    }
  });

  // Fetch dua requests with error handling
  const { 
    data: duaRequests = [], // varsayılan değer olarak boş dizi
    isLoading: isLoadingDuaRequests
  } = useQuery({
    queryKey: ['/api/dua-requests'],
    retry: 3,
    retryDelay: 1000,
    select: (data) => {
      return data || [];
    }
  });
  
  // Hata logları için etkinlik ve dua isteklerinin yüklenmesini izleme
  useEffect(() => {
    if (isErrorPosts) {
      console.error("Gönderiler yüklenirken hata oluştu");
    }
  }, [isErrorPosts]);

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <div key={i} className="mb-6">
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    ));
  };

  return (
    <>
      {/* Ana sayfa içeriği */}

      {/* Create Post */}
      <CreatePost />

      {/* Posts Feed */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-amiri text-xl font-bold text-primary dark:text-primary-light">
          Paylaşımlar
        </h2>
        {isErrorPosts && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchPosts()}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        )}
      </div>

      {isLoadingPosts ? (
        renderSkeletons()
      ) : isErrorPosts ? (
        <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
          <p className="text-red-600 dark:text-red-400 mb-2">Paylaşımlar yüklenirken bir hata oluştu.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchPosts()}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        </div>
      ) : posts && posts.length > 0 ? (
        <div>
          {posts.map((post: Post) => (
            post.type === 'hadith' || post.type === 'ayet' ? (
              <HadithPostCard key={post.id} post={post} />
            ) : (
              <PostCard key={post.id} post={post} />
            )
          ))}
          
          {/* Intersperse with events and dua requests */}
          {!isLoadingEvents && events && events.length > 0 && (
            <EventCard event={events[0] as Event} />
          )}
          
          {!isLoadingDuaRequests && duaRequests && duaRequests.length > 0 && (
            <DuaRequestCard duaRequest={duaRequests[0] as DuaRequest} />
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Henüz paylaşım yok.</p>
          {isAuthenticated && (
            <p className="text-primary">İlk paylaşımı yapmak için yukarıdaki kutuyu kullanabilirsiniz.</p>
          )}
        </div>
      )}
    </>
  );
}
