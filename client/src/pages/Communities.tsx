import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { IconUsers, IconPlus, IconSearch } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  image?: string | null;
  isJoined?: boolean;
}

const Communities = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { data: allCommunities, isLoading: allLoading } = useQuery({
    queryKey: ["/api/communities"],
  });
  
  const { data: myCommunities, isLoading: myCommunitiesLoading } = useQuery({
    queryKey: ["/api/communities/joined"],
    enabled: isAuthenticated,
  });
  
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/communities/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (communityData: typeof formData) => {
      const response = await apiRequest("POST", "/api/communities", communityData);
      return response.json();
    },
    onSuccess: () => {
      setOpen(false);
      setFormData({
        name: "",
        description: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      toast({
        title: "Topluluk oluşturuldu",
        description: "Topluluğunuz başarıyla oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Topluluk oluşturulamadı: ${error}`,
        variant: "destructive",
      });
    },
  });

  const joinCommunityMutation = useMutation({
    mutationFn: async (communityId: string) => {
      await apiRequest("POST", `/api/communities/${communityId}/join`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Topluluğa katılınamadı: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }
    createCommunityMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJoin = (communityId: string) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    joinCommunityMutation.mutate(communityId);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by the query hook
  };

  const renderCommunityCard = (community: Community) => (
    <Card key={community.id} className="overflow-hidden">
      {community.image && (
        <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img 
            src={community.image} 
            alt={community.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{community.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{community.description}</p>
        <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">
          <IconUsers className="mr-1 w-3 h-3" /> {community.memberCount} üye
        </Badge>
      </CardContent>
      <CardFooter>
        <Button 
          variant={community.isJoined ? "outline" : "default"}
          className="w-full"
          onClick={() => handleJoin(community.id)}
          disabled={joinCommunityMutation.isPending}
        >
          {community.isJoined ? "Katıldınız" : "Katıl"}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <div className="mb-6">
        <title>Topluluklar - MüslimNet</title>
        <meta name="description" content="İslami topluluklar ve gruplar. Ortak ilgi alanlarına sahip Müslümanlarla bir araya gelin." />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-amiri flex items-center">
          <IconUsers className="mr-2 text-primary" /> Topluluklar
        </h1>
        {isAuthenticated && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2" />
                Topluluk Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Topluluk Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Topluluk Adı</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createCommunityMutation.isPending}
                >
                  {createCommunityMutation.isPending ? "Oluşturuluyor..." : "Topluluk Oluştur"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="bg-white dark:bg-navy-dark rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Input
            placeholder="Topluluk ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </form>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="all" className="flex-1">Tüm Topluluklar</TabsTrigger>
          {isAuthenticated && (
            <TabsTrigger value="joined" className="flex-1">Katıldığım Topluluklar</TabsTrigger>
          )}
          {searchQuery.length > 2 && (
            <TabsTrigger value="search" className="flex-1">Arama Sonuçları</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="all">
          {allLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : allCommunities?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCommunities.map((community: Community) => renderCommunityCard(community))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz topluluk bulunmuyor.
            </div>
          )}
        </TabsContent>
        
        {isAuthenticated && (
          <TabsContent value="joined">
            {myCommunitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : myCommunities?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCommunities.map((community: Community) => renderCommunityCard(community))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Henüz bir topluluğa katılmadınız.
              </div>
            )}
          </TabsContent>
        )}
        
        {searchQuery.length > 2 && (
          <TabsContent value="search">
            {searchLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : searchResults?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((community: Community) => renderCommunityCard(community))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                "{searchQuery}" için sonuç bulunamadı.
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
      
      {!isAuthenticated && (
        <div className="mt-8 bg-white dark:bg-navy-dark rounded-lg shadow-md p-6 text-center">
          <h2 className="font-amiri text-xl mb-3">Topluluklara Katılmak İster misiniz?</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            İslami topluluklara katılmak, etkinliklere dahil olmak ve daha fazla içeriğe erişmek için giriş yapın.
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

export default Communities;
