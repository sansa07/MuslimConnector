import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import PrayerTimesWidget from "@/components/home/PrayerTimesWidget";
import DailyVerseCard from "@/components/home/DailyVerseCard";
import CreatePostCard from "@/components/home/CreatePostCard";
import PostCard from "@/components/posts/PostCard";
import HadithPostCard from "@/components/posts/HadithPostCard";
import EventCard from "@/components/events/EventCard";
import DuaRequestCard from "@/components/dua/DuaRequestCard";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });
  
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });
  
  const { data: duaRequestsData, isLoading: duaRequestsLoading } = useQuery({
    queryKey: ["/api/dua-requests"],
  });

  return (
    <>
      <div className="mb-6">
        <title>MüslimNet - İslami Sosyal Ağ</title>
        <meta name="description" content="MüslimNet - Müslüman bireylerin bir araya gelip bilgi, tecrübe, dua, etkinlik ve dini içerikleri paylaştığı sosyal ağ platformu." />
      </div>
      
      <PrayerTimesWidget />
      <DailyVerseCard />
      <CreatePostCard />
      
      {/* Posts */}
      {postsLoading ? (
        [...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-navy-dark rounded-lg shadow-md mb-6">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-40 w-full rounded-lg mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <>
          {postsData?.regularPosts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {postsData?.hadithPosts?.map((post: any) => (
            <HadithPostCard key={post.id} post={post} />
          ))}
        </>
      )}
      
      {/* Events */}
      {!eventsLoading && eventsData?.length > 0 && (
        <EventCard event={eventsData[0]} />
      )}
      
      {/* Dua Requests */}
      {!duaRequestsLoading && duaRequestsData?.length > 0 && (
        <DuaRequestCard duaRequest={duaRequestsData[0]} />
      )}
      
      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-white dark:bg-navy-dark rounded-lg shadow-md p-6 text-center">
          <h2 className="font-amiri text-xl mb-3">MüslimNet'e Hoş Geldiniz</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            İslami içerikler paylaşmak, dua isteklerinde bulunmak ve etkinliklere katılmak için hesap oluşturun.
          </p>
          <a 
            href="/api/login"
            className="inline-block py-2 px-6 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            Giriş Yap
          </a>
        </div>
      )}
    </>
  );
};

export default Home;
