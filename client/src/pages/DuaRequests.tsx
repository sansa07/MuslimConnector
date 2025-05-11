import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import DuaRequestCard from "@/components/dua/DuaRequestCard";
import { IconPlus, IconPraying } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

const DuaRequests = () => {
  const [open, setOpen] = useState(false);
  const [duaContent, setDuaContent] = useState("");
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { data: allDuaRequests, isLoading: allLoading } = useQuery({
    queryKey: ["/api/dua-requests"],
  });
  
  const { data: myDuaRequests, isLoading: myLoading } = useQuery({
    queryKey: ["/api/dua-requests/my-requests"],
    enabled: isAuthenticated,
  });
  
  const { data: prayedDuaRequests, isLoading: prayedLoading } = useQuery({
    queryKey: ["/api/dua-requests/prayed"],
    enabled: isAuthenticated,
  });

  const createDuaMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/dua-requests", { content });
      return response.json();
    },
    onSuccess: () => {
      setOpen(false);
      setDuaContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/dua-requests"] });
      toast({
        title: "Dua isteği oluşturuldu",
        description: "Dua isteğiniz paylaşıldı. Allah kabul etsin.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Dua isteği oluşturulamadı: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duaContent.trim()) {
      toast({
        title: "Boş içerik",
        description: "Lütfen dua isteğinizi yazın.",
        variant: "destructive",
      });
      return;
    }
    createDuaMutation.mutate(duaContent);
  };

  return (
    <>
      <div className="mb-6">
        <title>Dua İstekleri - MüslimNet</title>
        <meta name="description" content="Dua isteklerinizi paylaşın, diğer Müslümanlar için dua edin. Allah'ın rahmeti ve merhameti üzerinize olsun." />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-amiri flex items-center">
          <IconPraying className="mr-2 text-primary" /> Dua İstekleri
        </h1>
        {isAuthenticated && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2" />
                Dua İsteği Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dua İsteği</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Dua isteğinizi buraya yazın..."
                  value={duaContent}
                  onChange={(e) => setDuaContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createDuaMutation.isPending}
                >
                  {createDuaMutation.isPending ? "Gönderiliyor..." : "Gönder"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="text-center mb-8 p-4 bg-white dark:bg-navy-dark rounded-lg shadow-md">
        <p className="text-gray-700 dark:text-gray-300 italic font-amiri text-lg">
          "Duanız olmasa Rabbim size ne diye değer versin?" (Furkan Suresi, 77. Ayet)
        </p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="all" className="flex-1">Tüm İstekler</TabsTrigger>
          {isAuthenticated && (
            <>
              <TabsTrigger value="my-requests" className="flex-1">İsteklerim</TabsTrigger>
              <TabsTrigger value="prayed" className="flex-1">Dua Ettiklerim</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="all">
          {allLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 mb-6 rounded-lg" />
            ))
          ) : allDuaRequests?.length > 0 ? (
            allDuaRequests.map((duaRequest: any) => (
              <DuaRequestCard key={duaRequest.id} duaRequest={duaRequest} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz dua isteği bulunmuyor.
            </div>
          )}
        </TabsContent>
        
        {isAuthenticated && (
          <>
            <TabsContent value="my-requests">
              {myLoading ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-48 mb-6 rounded-lg" />
                ))
              ) : myDuaRequests?.length > 0 ? (
                myDuaRequests.map((duaRequest: any) => (
                  <DuaRequestCard key={duaRequest.id} duaRequest={duaRequest} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Henüz bir dua isteği oluşturmadınız.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="prayed">
              {prayedLoading ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-48 mb-6 rounded-lg" />
                ))
              ) : prayedDuaRequests?.length > 0 ? (
                prayedDuaRequests.map((duaRequest: any) => (
                  <DuaRequestCard key={duaRequest.id} duaRequest={duaRequest} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Henüz dua ettiğiniz bir istek bulunmuyor.
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
      
      {!isAuthenticated && (
        <div className="mt-8 bg-white dark:bg-navy-dark rounded-lg shadow-md p-6 text-center">
          <h2 className="font-amiri text-xl mb-3">Dua İsteği Oluşturmak İster misiniz?</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Kendi dua isteğinizi paylaşmak ve diğer Müslümanların dualarını kabul etmek için giriş yapın.
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

export default DuaRequests;
