import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/posts/PostCard";
import HadithPostCard from "@/components/posts/HadithPostCard";
import { IconSearch } from "@/lib/icons";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  
  const { data: trendingPosts, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/posts/trending"],
  });
  
  const { data: latestPosts, isLoading: latestLoading } = useQuery({
    queryKey: ["/api/posts/latest"],
  });
  
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by the query hook when searchQuery changes
  };

  return (
    <>
      <div className="mb-6">
        <title>Keşfet - MüslimNet</title>
        <meta name="description" content="MüslimNet'te popüler ve yeni içerikleri keşfedin. Dua istekleri, İslami paylaşımlar ve daha fazlası." />
      </div>
      
      <div className="bg-white dark:bg-navy-dark rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Input
            placeholder="İçerik, kullanıcı veya etiket ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </form>
      </div>
      
      <Tabs defaultValue="trending" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="trending" className="flex-1">Popüler</TabsTrigger>
          <TabsTrigger value="latest" className="flex-1">En Yeni</TabsTrigger>
          {searchQuery.length > 2 && (
            <TabsTrigger value="search" className="flex-1">Arama Sonuçları</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="trending">
          {trendingLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 mb-6 rounded-lg" />
            ))
          ) : (
            <>
              {trendingPosts?.map((post: any) => (
                post.type === "hadith" ? (
                  <HadithPostCard key={post.id} post={post} />
                ) : (
                  <PostCard key={post.id} post={post} />
                )
              ))}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="latest">
          {latestLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 mb-6 rounded-lg" />
            ))
          ) : (
            <>
              {latestPosts?.map((post: any) => (
                post.type === "hadith" ? (
                  <HadithPostCard key={post.id} post={post} />
                ) : (
                  <PostCard key={post.id} post={post} />
                )
              ))}
            </>
          )}
        </TabsContent>
        
        {searchQuery.length > 2 && (
          <TabsContent value="search">
            {searchLoading ? (
              [...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64 mb-6 rounded-lg" />
              ))
            ) : searchResults?.length > 0 ? (
              <>
                {searchResults.map((result: any) => (
                  result.type === "hadith" ? (
                    <HadithPostCard key={result.id} post={result} />
                  ) : (
                    <PostCard key={result.id} post={result} />
                  )
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                "{searchQuery}" için sonuç bulunamadı.
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </>
  );
};

export default Explore;
